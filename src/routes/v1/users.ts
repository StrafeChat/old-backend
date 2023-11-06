import express from "express";
import Validator from "../../util/Validator";
import FriendRequest from "../../database/models/FriendRequest";
import { Op } from "sequelize";
import User from "../../database/models/User";
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

router.post("/@me/relationships", Validator.verifyToken, async (req, res) => {

})

export default router;
