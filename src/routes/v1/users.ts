import express from "express";
import Validator from "../../util/Validator";
import FriendRequest from "../../database/models/FriendRequest";
import { Op } from "sequelize";
import User from "../../database/models/User";
import { sockets } from "../..";
import { WsOpCodes } from "../../config/OpCodes";
const router = express.Router();

router.get("/@me", Validator.verifyToken, (req, res) => {
  res.status(200).json({ code: 200, data: req.body.user.toJSON() });
});

router.get("/", Validator.verifyToken, async (req, res) => {
  if (req.body.tag) {
    const query = req.body.split("#");
    const user = await User.findOne({
      where: {
        username: query[0],
        tag: query[1]
      }
    });

    if (!user) return res.status(404).json({ code: 404, message: "User not found." });

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
      }
    });
  } else if (req.body.id) {
    const user = await User.findByPk(req.body.id);
    if (!user) return res.status(404).json({ code: 404, message: "User not found." });
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
      }
    });
  }
})

router.get("/@me/relationships", Validator.verifyToken, async (req, res) => {
  const requests = await FriendRequest.findAll({
    where: {
      [Op.or]: [{ senderId: req.body.user.id }, { recieverId: req.body.user.id }]
    }
  });
  res.status(200).json({ code: 200, data: requests });
});

router.post("/@me/relationships/:userId", Validator.verifyToken, async (req, res) => {
  const senderId = req.body.user.id;
  const receiverId = req.params.userId;
  if (senderId == receiverId) return res.status(400).json({ code: 400, message: "You cannot add yourself as a friend :/" });

  try {
    const exists = await FriendRequest.findOne({ where: { senderId, receiverId } });
    if (exists) return res.status(400).json({ code: 400, message: "Friend request already sent." });
    if (!await User.findOne({ where: { id: receiverId } })) return res.status(404).json({ code: 404, message: "A user was not found to add as a friend." });
    const newRequest = await FriendRequest.create({
      senderId,
      receiverId,
      status: "pending"
    });

    sockets.get(senderId)?.send(JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: newRequest }));
    sockets.get(receiverId)?.send(JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: newRequest }));

    return res.status(201).json({ code: 201, data: newRequest });
  } catch (err) {
    return res.status(500).json({ code: 500, message: 'Error sending friend request.' });
  }
});

router.patch("/@me/relationships/:userId", Validator.verifyToken, async (req, res) => {
  const senderId = req.body.user.id;
  const receiverId = req.params.userId;
  const { action } = req.body;

  try {
    const request = await FriendRequest.findOne({
      where: {
        senderId,
        receiverId,
        status: "pending",
      },
    });

    if (!request) return res.status(404).json({ code: 404, message: "Friend request not found." });
    switch (action) {
      case "accept":
        request.status = "accepted";
        await request.save();
        sockets.get(senderId)?.send(JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: request }));
        sockets.get(receiverId)?.send(JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: request }));
        break;
      case "reject":
        request.status = "rejected";
        await request.save();
        sockets.get(senderId)?.send(JSON.stringify({ op: WsOpCodes.FRIEND_REQUEST, data: request }));
        break;
      default:
        return res.status(400).json({ code: 400, message: "Invalid action for friend request." });
    }
  } catch (err) {
    res.status(500).json({ code: 500, message: "Error updating friend request." });
  }
});

export default router;
