import { Router } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import fs from "fs";
import Generator from "../../util/Generator";
import Validator, { LoginData, RegisterData } from "../../util/Validator";
import User from "../../database/models/User";

dotenv.config();

const router = Router();

router.post("/login", async (req, res) => {
  const data: LoginData = req.body;
  const result = Validator.login(data);
  if (result.error)
    return res.status(400).json({ code: 400, message: result.error.message });
  const user = await User.findOne({ where: { email: data.email } });

  if (!user)
    return res
      .status(403)
      .json({ code: 403, message: "A user with this email does not exist." });

  const validPass = await bcrypt.compare(data.password!, user.password!);

  if (!validPass)
    return res
      .status(401)
      .json({ code: 400, message: "The password you have used is incorrect." });

  const lastLogin = Date.now();
  user.lastLogin = new Date(lastLogin);
  await user.save();

  const token = await Generator.generateToken({
    id: user.id,
    timestamp: lastLogin,
    secret: user.secret,
  });

  return res.status(200).json({ code: 200, data: token });
});

router.post("/register", async (req, res) => {
  const data: RegisterData = req.body;
  const result = Validator.register(data);
  if (result.error)
    return res.status(400).json({ code: 400, message: result.error.message });

  if (parseInt(data.tag!) < 1)
    return res
      .status(400)
      .json({ code: 400, message: "Tag should be atleast 0001" });

  if (await User.findOne({ where: { email: data.email } }))
    return res
      .status(403)
      .json({ code: 403, message: "A user with this email already exists." });

  if (await User.findOne({ where: { username: data.username, tag: data.tag } }))
    return res.status(403).json({
      code: 403,
      message: "A user with this username and tag already exists.",
    });

  const password = await bcrypt.hash(data.password!, 9);
  const id = Generator.generateSnowflake();
  const timestamp = Date.now();
  const secret = Generator.generateSecret(12);

  try {
    const token = await Generator.generateToken({
      id: id,
      timestamp: timestamp,
      secret: secret,
    });
    try {
      const user = await User.create({
        avatar: `${process.env.CDN_URL}/avatars/${id}`,
        id: id,
        bot: false,
        email: data.email,
        locale: data.locale,
        password: password,
        secret: secret,
        tag: data.tag,
        username: data.username,
        dob: data.dob,
        lastLogin: new Date(timestamp),
      });

      if (!user)
        res.status(500).json({
          code: 500,
          message:
            "Something went wrong when trying to create your account, please try again.",
        });

      fs.readFile(
        `src/resources/avatars/${`avatar${
          Math.floor(Math.random() * (7 - 1 + 1)) + 1
        }.png`}`,
        async (err, data) => {
          await fetch(`${process.env.CDN_URL}/avatars/${id}`, {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: data.toString("base64"),
            }),
          });
        }
      );

      res.status(200).json({ code: 200, data: token });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        code: 500,
        message:
          "Something went wrong when trying to create your account, please try again.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      message:
        "Something went wrong when trying to create your account, please try again.",
    });
  }
});

export default router;
