import joi from "joi";

export interface RegisterData {
  email?: string;
  username?: string;
  tag?: string;
  password?: string;
  locale?: string;
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
          .pattern(new RegExp("^[a-zA-Z0-9]"))
          .required()
          .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.max": "Password can have a maximum of 30 characters.",
            "string.trim": "Password cannot contain spaces.",
            "string.pattern":
              "Password can only contain letters (uppercase or lowercase) and digits (0-9). Special characters are not allowed.",
            "any.required": "Password is required.",
          }),
        locale: joi.string().required(),
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
          .pattern(new RegExp("^[a-zA-Z0-9]"))
          .required()
          .messages({
            "string.min": "Password must be at least 8 characters long.",
            "string.max": "Password can have a maximum of 30 characters.",
            "string.trim": "Password cannot contain spaces.",
            "string.pattern":
              "Password can only contain letters (uppercase or lowercase) and digits (0-9). Special characters are not allowed.",
            "any.required": "Password is required.",
          }),
      })
      .validate(data);
  }
}
