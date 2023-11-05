import express from "express";
import Validator from "../../util/Validator";
import FriendRequest from "../../database/models/FriendRequest";
import { Op } from "sequelize";
const router = express.Router();

router.get("/@me", Validator.verifyToken, (req, res) => {
  res.status(200).json({ code: 200, data: req.body.user.toJSON() });
});

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
