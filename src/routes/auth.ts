import { Router } from "express";
import bcrypt from "bcrypt";
import Validator, { RegisterData } from "../util/Validator";
import User from "../models/User";
import Generator from "../util/Generator";

interface LoginData {
  email?: string;
  password?: string;
}

const router = Router();

router.post("/login", async (req, res) => {
  //   const data: LoginData = req.body;
  //   const emailVal = Validator.email(data.email);
  //   const passVal = Validator.password(data.password);
  //   if (emailVal.code != 200) return res.status(emailVal.code).json(emailVal);
  //   if (passVal.code != 200) return res.status(passVal.code).json(passVal);
  //   const user = await User.findOne({email: data.email});
  //   if(user) {
  //   }
  //   return res.status(200).json({ code: 200, data: data });
});

router.post("/register", async (req, res) => {
  const data: RegisterData = req.body;
  const result = Validator.register(data);

  if (result.error)
    return res.status(400).json({ code: 400, message: result.error.message });

  // for(let i = 0; i < 10000; i++) {

  // }

  if (parseInt(data.tag!) < 1)
    return res
      .status(400)
      .json({ code: 400, message: "Tag should be atleast 0001" });

  if (await User.findOne({ email: data.email }))
    return res
      .status(403)
      .json({ code: 403, message: "A user with this email already exists." });

  if (await User.findOne({ username: data.username, tag: data.tag }))
    return res.status(403).json({
      code: 403,
      message: "A user with this username and tag already exists.",
    });

  const password = await bcrypt.hash(data.password!, 9);

  const id = Generator.generateSnowflake();
  const timestamp = Date.now();
  const secret = Generator.generateSecret(12);

  console.log(id);

  try {
    const token = await Generator.generateToken({
      id: id,
      timestamp: timestamp,
      secret: secret,
    });
    try {
      const user = await User.create({
        _id: id,
        bot: false,
        email: data.email,
        password: password,
        secret: secret,
        tag: data.tag,
        username: data.username,
      });

      if (!user)
        res.status(500).json({
          code: 500,
          message:
            "Something went wrong when trying to create your account, please try again.",
        });

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
