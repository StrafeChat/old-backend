import joi from "joi";
import User from "../database/models/User";
import { WsErrors } from "../config/Errors";
import { NextFunction, Request, Response } from "express";

export interface RegisterData {
  email?: string;
  username?: string;
  tag?: string;
  password?: string;
  locale?: string;
  dob?: Date;
}

export interface LoginData {
  email?: string;
  password?: string;
}

export default class Validation {
  public static register(data: RegisterData) {
    return joi
      .object({
        email: joi.string().email().required().messages({
          "string.email":
            "Invalid email format. Please provide a valid email address",
          "any.required": "Email is required.",
        }),
        username: joi
          .string()
          .min(2)
          .max(24)
          .regex(/[@#:`]/, { invert: true })
          .trim()
          .required()
          .messages({
            "string.min": "Username must be at least 2 characters long.",
            "string.max": "Username can have a maximum of 24 characters.",
            "object.regex": "Username cannot contain special characters.",
            "string.trim": "Username cannot contain spaces.",
            "any.required": "Username is required.",
          }),
        tag: joi
          .string()
          .trim()
          .length(4)
          .regex(/[a-z]/, { invert: true })
          .required()
          .messages({
            "string.trim": "Tag cannot contain spaces.",
            "string.length": "Tag must be exactly 4 characters long.",
            "object.regex": "Tag cannot contain letters.",
            "any.required": "Tag is required.",
          }),
        password: joi
          .string()
          .min(8)
          .max(30)
          .trim()
          .required()
          .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.max": "Password can have a maximum of 30 characters.",
            "string.trim": "Password cannot contain spaces.",
            "any.required": "Password is required.",
          }),
        locale: joi.string().required().messages({
          "any.required": "Locale is required.",
        }),
        dob: joi.date().required().messages({
          "any.required": "dob (Date of birth) is required.",
        }),
      })
      .validate(data);
  }

  public static login(data: RegisterData) {
    return joi
      .object({
        email: joi.string().email().required().messages({
          "string.email":
            "Invalid email format. Please provide a valid email address",
          "any.required": "Email is required.",
        }),
        password: joi
          .string()
          .min(8)
          .max(30)
          .trim()
          .required()
          .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.max": "Password can have a maximum of 30 characters.",
            "string.trim": "Password cannot contain spaces.",
            "any.required": "Password is required.",
          }),
      })
      .validate(data);
  }

  public static async token(input: string) {
    if (!input)
      return {
        code: WsErrors.AUTHENTICATION_FAILED,
        message: "Access denied.",
      };

    const parts = input.split(".");
    if (parts.length < 3) return { code: 401, message: "Access denied." };
    if (parts.length > 3) return { code: 401, message: "Access denied." };

    const id = atob(parts[0]);
    const timestamp = parseInt(atob(parts[1]));
    const secret = atob(parts[2]);

    const user = await User.findByPk(id);

    if (!user)
      return {
        code: WsErrors.AUTHENTICATION_FAILED,
        message: "Access denied.",
      };
    if (user.lastLogin.getTime() != timestamp || user.secret != secret)
      return {
        code: WsErrors.AUTHENTICATION_FAILED,
        message: "Access denied.",
      };

    return { code: 200, data: user };
  }

  public static async verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!req.headers["authorization"])
      return {
        code: WsErrors.AUTHENTICATION_FAILED,
        message: "Access denied.",
      };

    const parts = req.headers["authorization"].split(".");
    if (parts.length < 3)
      return res.status(401).json({ code: 401, message: "Access denied." });
    if (parts.length > 3)
      return res.status(401).json({ code: 401, message: "Access denied." });

    const id = atob(parts[0]);
    const timestamp = parseInt(atob(parts[1]));
    const secret = atob(parts[2]);

    const user = await User.findByPk(id);

    if (!user)
      return res.status(401).json({
        code: 401,
        message: "Access denied.",
      });

    if (user.lastLogin.getTime() != timestamp || user.secret != secret)
      return res.status(401).json({
        code: 401,
        message: "Access denied.",
      });

    req.body.user = user; //:ahhhh:
    next();
  }
}
