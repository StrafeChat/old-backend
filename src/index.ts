import { RawData, WebSocket, WebSocketServer } from "ws";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import db from "./database/connection";
import dotenv from "dotenv";
import fs from "fs";
import { WsOpCodes } from "./config/OpCodes";
import User from "./database/models/User";
import Validator from "./util/Validator";
import { WsErrors } from "./config/Errors";

const clients = new Map<string, [User, WebSocket]>();

const app = express();

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
    sendData(client, {
      op: WsOpCodes.HELLO,
      data: { heartbeatInterval: 45000 },
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
      break;
    case WsOpCodes.IDENTIFY:
      if (!data.token)
        client.close(
          WsOpCodes.IDENTIFY,
          "The account token sent with your identify payload is incorrect."
        );
      const validation = await Validator.token(data.token);
      if (validation?.code != 200)
        client.close(validation?.code, validation?.message);
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
