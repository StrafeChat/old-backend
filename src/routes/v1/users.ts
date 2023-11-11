import express from "express";
import Validator from "../../util/Validator";
import FriendRequest from "../../database/models/FriendRequest";
import { Op } from "sequelize";
import User from "../../database/models/User";
import { sockets } from "../..";
import { WsOpCodes } from "../../config/OpCodes";
import Generator from "../../util/Generator";
import Room from "../../database/models/Room";
import RoomRecipient from "../../database/models/RoomRecipient";
const router = express.Router();

router.get("/@me", Validator.verifyToken, (req, res) => {
  res.status(200).json({ code: 200, data: req.body.user.toJSON() });
});

// Get Private Messages
router.get("/@me/rooms", Validator.verifyToken, async (req, res) => {
  try {
    const data = await RoomRecipient.findAll({
      where: {
        userId: req.body.user.id,
      },
      include: [
        {
          model: Room,
          as: "room",
          include: [
            {
              model: User,
              as: "recipients",
            },
          ],
        },
        {
          model: User,
          as: "user",
        },
      ],
    });

    return res
      .status(200)
      .json({ code: 200, data: data.map((recipient) => recipient.room) });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ code: 500, message: "Internal Server Error" });
  }
});
// Create Private Messages
router.post("/@me/rooms", Validator.verifyToken, async (req, res) => {
  if (!req.body.recipientId) {
    return res
      .status(400)
      .json({ code: 400, message: "Recipient id is required." });
  }

  if (req.body.recipientId === req.body.user.id) {
    return res
      .status(400)
      .json({ code: 400, message: "You cannot create a pm for only you :/" });
  }

  try {
    const existingDMRoom = await Room.findOne({
      where: {
        type: 0,
      },
      include: [
        {
          model: User,
          as: "recipients",
          where: {
            id: {
              [Op.in]: [req.body.user.id, req.body.recipientId],
            },
          },
        },
      ],
    });

    console.log(existingDMRoom);

    if (existingDMRoom) {
      return res.status(409).json({
        code: 409,
        message: "A dm already exists between you and that user!",
      });
    }

    const receiver = await User.findByPk(req.body.recipientId);

    if (!receiver) {
      return res
        .status(404)
        .json({ code: 404, message: "Recipient user not found." });
    }

    const room = await Room.create({
      id: Generator.generateSnowflake(),
      totalMessagesSent: 0,
      type: 0,
    });

    await room.$add("recipients", [req.body.user.id, req.body.recipientId]);
    const savedRoom = await room.save();

    res.status(201).json({ code: 201, data: savedRoom });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message: "Failed to create the dm room with the user.",
    });
  }
});

router.get("/", Validator.verifyToken, async (req, res) => {
  if (req.body.tag) {
    const query = req.body.split("#");
    const user = await User.findOne({
      where: {
        username: query[0],
        tag: query[1],
      },
    });

    if (!user)
      return res.status(404).json({ code: 404, message: "User not found." });

    res.status(200).json({
      code: 200,
      data: {
        id: user.id,
        avatar: user.avatar,
        banner: user.banner,
        bot: user.bot,
        createdAt: user.createdAt,
        displayName: user.displayName,
        tag: user.tag,
        username: user.username,
      },
    });
  } else if (req.body.id) {
    const user = await User.findByPk(req.body.id);
    if (!user)
      return res.status(404).json({ code: 404, message: "User not found." });
    res.status(200).json({
      code: 200,
      data: {
        id: user.id,
        avatar: user.avatar,
        banner: user.banner,
        bot: user.bot,
        createdAt: user.createdAt,
        displayName: user.displayName,
        tag: user.tag,
        username: user.username,
      },
    });
  }
});

router.get("/@me/relationships", Validator.verifyToken, async (req, res) => {
  const attributes = {
    exclude: [
      "blocked",
      "dms",
      "dob",
      "email",
      "lastLogin",
      "notifications",
      "password",
      "preferences",
      "secret",
      "",
    ],
  };
  const requests = await FriendRequest.findAll({
    where: {
      [Op.or]: [
        { senderId: req.body.user.id },
        { receiverId: req.body.user.id },
      ],
    },
    include: [
      { model: User, as: "sender", attributes },
      { model: User, as: "receiver", attributes },
    ],
  });
  res.status(200).json({ code: 200, data: requests });
});

// Create Friend
router.post(
  "/@me/relationships/:query",
  Validator.verifyToken,
  async (req, res) => {
    const sender = req.body.user;
    const query = req.params.query.split("-");

    try {
      if (sender.username == query[0] && sender.tag == query[1])
        return res.status(400).json({
          code: 400,
          message: "You cannot add yourself as a friend :/",
        });
      const receiver = await User.findOne({
        where: { username: query[0], tag: query[1] },
      });
      if (!receiver)
        return res.status(404).json({
          code: 404,
          message: "A user was not found to add as a friend.",
        });

      const exists =
        (await FriendRequest.findOne({
          where: { senderId: sender.id, receiverId: receiver.id },
        })) ||
        (await FriendRequest.findOne({
          where: { senderId: receiver.id, receiverId: sender.id },
        }));
      if (exists)
        return res
          .status(400)
          .json({ code: 400, message: "Friend request already sent." });
      const newRequest = await FriendRequest.create({
        id: Generator.generateSnowflake(),
        senderId: sender.id,
        receiverId: receiver.id,
        status: "pending",
      });

      sockets
        .get(sender.id)
        ?.send(
          JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: newRequest })
        );
      sockets
        .get(receiver.id)
        ?.send(
          JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: newRequest })
        );

      return res.status(201).json({ code: 201, data: newRequest });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ code: 500, message: "Error sending friend request." });
    }
  }
);

router.patch(
  "/@me/relationships/:query",
  Validator.verifyToken,
  async (req, res) => {
    const query = req.params.query.split("-");

    const { action } = req.body;

    try {
      switch (action) {
        case "accept":
          const receiver = req.body.user;
          const sender = await User.findOne({
            where: { username: query[0], tag: query[1] },
          });
          if (!sender)
            return res.status(404).json({
              code: 404,
              message: "This user does not exist anymore.",
            });

          const request = await FriendRequest.findOne({
            where: {
              senderId: sender.id,
              receiverId: receiver.id,
              status: "pending",
            },
          });

          if (!request)
            return res
              .status(404)
              .json({ code: 404, message: "Friend request not found." });

          request.status = "accepted";
          await request.save().then(async (savedReq) => {
            const existingPMRoom = await Room.findOne({
              where: {
                type: 0,
              },
              include: [
                {
                  model: User,
                  as: "recipients",
                  where: {
                    id: savedReq.receiverId,
                  },
                },
                {
                  model: User,
                  as: "recipients",
                  where: {
                    id: savedReq.senderId,
                  },
                },
              ],
            });

            if (!existingPMRoom) {
              const room = await Room.create({
                id: Generator.generateSnowflake(),
                totalMessagesSent: 0,
                type: 0,
              });

              await room.$add("recipients", [
                savedReq.senderId,
                savedReq.receiverId,
              ]);
              await room.save();
            }
          });
          sockets
            .get(sender.id)
            ?.send(
              JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: request })
            );
          sockets
            .get(receiver.id)
            ?.send(
              JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: request })
            );
          break;
        case "reject":
          // request.status = "rejected";
          // await request.save();
          // sockets.get(sender.id)?.send(JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: request }));

          break;
        default:
          return res
            .status(400)
            .json({ code: 400, message: "Invalid action for friend request." });
      }
    } catch (err) {
      res
        .status(500)
        .json({ code: 500, message: "Error updating friend request." });
    }
  }
);

export default router;
