import mongoose from "mongoose";
import Generator from "../util/Generator";

export interface IUserStatus {
  name:
    | "online"
    | "offline"
    | "idle"
    | "dnd"
    | "coding"
    | "streaming"
    | "sleeping"
    | "custom";
  icon?: string;
  text?: string;
}

export interface IUser {
  _id: string;
  avatar: string | null;
  banner: string;
  bio: string | null;
  bot: boolean;
  email: string | undefined;
  password: string | undefined;
  status: IUserStatus;
  tag: string;
  username: string;
}

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    bot: {
      type: Boolean,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    secret: {
      type: String,
      required: true,
    },
    status: {
      type: Object,
      default: {
        name: "offline",
      },
    },
    tag: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

export default mongoose.model<IUser>("users", schema, "users");
