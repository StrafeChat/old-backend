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
import FriendRequest from "./database/models/FriendRequest";
import Generator from "./util/Generator";
import { Op } from "sequelize";

const clients = new Map<
  WebSocket,
  { timer: NodeJS.Timeout | null; user: User | null }
>();
const sockets = new Map<string, WebSocket>();

const app = express();
const heartbeatInterval = 10000;

dotenv.config();

// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
// 	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
// 	// store: ... , // Use an external store for consistency across multiple server instances.
// })

// app.use(limiter);
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

  let user: User | undefined | null = undefined;

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
          user = clients.get(client)?.user;
          if (!user) return;
          user.status = {
            name: user.status.name,
            online: false,
          };
          await user?.save();
          clients.delete(client);
        }, heartbeatInterval + 1000),
        user: validation.data!,
      });

      if (!validation.data) return;

      validation.data.status = {
        name: validation.data.status.name,
        online: true,
      };

      user = await validation.data?.save();

      sockets.set(user.id, client);

      client.send(
        JSON.stringify({
          op: WsOpCodes.DISPATCH,
          data: {
            id: user?.id,
            accentColor: user?.accentColor,
            avatar: user?.avatar,
            banner: user?.banner,
            bot: user?.bot,
            createdAt: user?.createdAt,
            displayName: user?.displayName,
            email: user?.email,
            preferences: user?.preferences,
            status: user?.status,
            tag: user?.tag,
            username: user?.username,
          },
          event: "READY",
        })
      );
      break;
    case WsOpCodes.FRIEND_REQUEST:
      user = clients.get(client)!.user;
      if (user) {
        if (data.from !== user.id) return;
        if (await FriendRequest.findOne({ where: { senderId: user.id, recieverId: data.to } })) return;
        const request = await FriendRequest.create({
          id: Generator.generateSnowflake(),
          senderId: user.id,
          recieverId: data.to,
          status: "pending"
        })
        const socket = sockets.get(user.id);
        if (socket) sendData(socket, { op: WsOpCodes.FRIEND_REQUEST, data: request });
      }
      break;
    case WsOpCodes.PRESENCE_UPDATE:
      user = clients.get(client)!.user;
      if (user && data.status) {
        user.status = {
          ...user.status,
          name: data.status
        };

        user.save().then(async (saved) => {
          const data = { status: saved.status, user: saved };
          sendData(client, { op: WsOpCodes.PRESENCE_UPDATE, data });
          
          FriendRequest.findAll({
            where: {
              [Op.or]: [
                { receiverId: saved.id, status: "accepted" },
                { senderId: saved.id, status: "accepted" },
              ]
            }
          }).then((requests) => {
            for (const request of requests) {
              const user = sockets.get(saved.id != request.senderId ? request.senderId : request.receiverId);
              if (user) sendData(user, { op: WsOpCodes.PRESENCE_UPDATE, data });
            }
          })
        });
      }
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

export { clients, sockets };