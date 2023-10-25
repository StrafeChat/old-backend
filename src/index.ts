import { RawData, WebSocket, WebSocketServer } from "ws";
import { WsOpCodes } from "./config/OpCodes";
import { WsErrors } from "./config/Errors";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import db from "./database/connection";
import dotenv from "dotenv";
import fs from "fs";
import User from "./database/models/User";
import Validator from "./util/Validator";

const clients = new Map<
  WebSocket,
  { timer: NodeJS.Timeout | null; user: User | null }
>();

const app = express();
const heartbeatInterval = 10000;

dotenv.config();

app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
  })
);
for (const version of fs.readdirSync("src/routes")) {
  for (const route of fs.readdirSync(`src/routes/${version}`)) {
    app.use(
      `/${version}/${route.replace(".ts", "")}`,
      require(`./routes/${version}/${route}`).default
    );
  }
}

db.sync({ alter: true }).then(() => {
  const server = app.listen(process.env.PORT!, async () => {
    console.log(`Listening on port ${[process.env.PORT!]}`);
  });

  const wss = new WebSocketServer({ server });

  wss.on("connection", (client) => {
    clients.set(client, { timer: null, user: null });
    sendData(client, {
      op: WsOpCodes.HELLO,
      data: { heartbeatInterval },
    });
    client.on("error", console.error);
    client.on("message", (data) => {
      handleWsMessage(client, data);
    });
  });
});

const handleWsMessage = async (client: WebSocket, rawData: RawData) => {
  const { op, data }: { op: WsOpCodes; data: any } = JSON.parse(
    rawData.toString("utf-8")
  );

  switch (op) {
    case WsOpCodes.HEARTBEAT:
      sendData(client, { op: WsOpCodes.HEARTBEAT_ACK, data: null });
      const clt = clients.get(client);
      if (clt) clt.timer?.refresh();
      break;
    case WsOpCodes.IDENTIFY:
      if (!data.token)
        client.close(
          WsErrors.AUTHENTICATION_FAILED,
          "The account token sent with your identify payload is incorrect."
        );
      const validation = await Validator.token(data.token);
      if (validation?.code != 200)
        client.close(validation?.code, validation?.message);

      clients.set(client, {
        timer: setTimeout(async () => {
          client.close(
            WsErrors.SESSION_TIMED_OUT,
            "You couldn't keep up with strafe, please try reconnecting."
          );
          const user = clients.get(client)?.user;
          user!.status = {
            name: "offline",
          };
          await user?.save();
          clients.delete(client);
        }, heartbeatInterval + 1000),
        user: validation.data!,
      });

      validation.data!.status = {
        name: "online",
      };

      const user = await validation.data?.save();

      client.send(
        JSON.stringify({
          op: WsOpCodes.DISPATCH,
          data: {
            id: user?.id,
            avatar: user?.avatar,
            banner: user?.banner,
            bot: user?.bot,
            createdAt: user?.createdAt,
            displayName: user?.displayName,
            tag: user?.tag,
            username: user?.username,
          },
          event: "READY",
        })
      );
      break;
    default:
      client.close(
        WsErrors.UNKNOWN_OPCODE,
        "You sent an invalid Gateway opcode!"
      );
      break;
  }
};

const sendData = (ws: WebSocket, { op, data }: { op: number; data: any }) => {
  ws.send(JSON.stringify({ op, data }));
};
