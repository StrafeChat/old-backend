import express from "express";
import Validation from "../../util/Validator";
import Room from "../../database/models/Room";
import Message from "../../database/models/Message";
import Generator from "../../util/Generator";
import { sockets } from "../..";
import { WsOpCodes } from "../../config/OpCodes";
import User from "../../database/models/User";
const router = express.Router();
import { rateLimit } from "express-rate-limit";

router.post(
  "/:roomId/messages",
  Validation.verifyToken,
  rateLimit({
    windowMs: 3000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
  async (req, res) => {
    console.log(req.body.content);
    if (!req.params.roomId)
      return res
        .status(401)
        .json({ code: 401, message: "Room ID is required!" });
    const room = await Room.findByPk(req.params.roomId, {
      include: [
        {
          model: User,
          as: "recipients",
        },
      ],
    });
    if (!room)
      return res.status(404).json({
        code: 404,
        message: "The room you were looking for does not exist.",
      });

    switch (room.type) {
      case 0:
        if (!room.recipients?.find((user) => user.id == req.body.user.id)) {
          console.log("No Access!");
          return res
            .status(403)
            .json({
              code: 403,
              message: "You do not have access to this room.",
            });
        }

        await Message.create({
          id: Generator.generateSnowflake(),
          authorId: req.body.user.id,
          content: req.body.content,
          embeds: req.body.embeds,
          roomId: req.params.roomId,
        }).then(async (message) => {
          await message.reload({ include: User });
          for (const user of room.recipients!) {
            sockets.get(user.id)?.send(
              JSON.stringify({
                op: WsOpCodes.DISPATCH,
                event: "MESSAGE_CREATE",
                data: message,
              })
            );
          }
        });
        res.status(200).send("Done!");
        break;
      default:
        res.status(403).json({
          code: 403,
          message: "This channel does not support message sending.",
        });
        break;
    }
  }
);

router.get("/:roomId/messages", Validation.verifyToken, async (req, res) => {
  if (!req.params.roomId)
    return res.status(401).json({ code: 401, message: "Room ID is required!" });

  const page = parseInt(req.query.page as string);

  if (isNaN(page))
    return res
      .status(401)
      .json({ code: 401, message: "Page number is required!" });

  const pageSize = 35;

  const room = await Room.findByPk(req.params.roomId, {
    include: [
      {
        model: User,
        as: "recipients",
      },
    ],
  });

  if (!room)
    return res.status(404).json({
      code: 404,
      message: "The room you were looking for does not exist",
    });

  switch (room.type) {
    case 0:
      if (!room.recipients?.find((user) => user.id == req.body.user.id)) {
        return res
          .status(403)
          .json({ code: 403, message: "You do not have access to this room." });
      }
      const data = await Message.findAndCountAll({
        where: {
          roomId: req.params.roomId,
        },
        include: [
          {
            model: User,
            as: "author",
          },
        ],
        order: [["createdAt", "DESC"]],
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });

      const resData = {
        totalPages: Math.ceil(data?.count / pageSize),
        totalSize: data.count,
        data: data.rows,
      };

      if (page > resData.totalPages)
        return res
          .status(404)
          .json({ code: 404, message: "Messages page not found." });

      return res.status(200).json({ code: 200, data: resData.data.reverse() });
    default:
      res.status(403).json({
        code: 403,
        message: "This channel does not have any messages.",
      });
      break;
  }
});

router.post("/:roomId/typing", Validation.verifyToken, async (req, res) => {
  const room = await Room.findByPk(req.params.roomId, {
    include: [
      {
        model: User,
        as: "recipients",
      },
    ],
  });

  if (!room) {
    return res.status(404).json({
      code: 404,
      message: "The room you were looking for does not exist",
    });
  }

  switch (room.type) {
    case 0:
      if (!room.recipients?.find((user) => user.id == req.body.user.id)) {
        return res
          .status(403)
          .json({ code: 403, message: "You do not have access to this room." });
      }

      for (const user of room.recipients!) {
        sockets.get(user.id)?.send(
          JSON.stringify({
            op: WsOpCodes.DISPATCH,
            event: "TYPING_UPDATE",
            data: {
              roomId: room.id,
              username: req.body.user.username,
              timestamp: Date.now(),
            },
          })
        );
      }

      return res
        .status(200)
        .json({ code: 200, message: "Typing notification sent." });

    default:
      res.status(403).json({
        code: 403,
        message: "This channel does not support typing notifications.",
      });
      break;
  }
});

export default router;
