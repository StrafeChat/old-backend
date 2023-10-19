import crypto from "crypto";
import Snowflake from "./Snowflake";

interface TokenData {
  id: string;
  timestamp: number;
  secret: string;
}

export default class Generator {
  private static snowflake = new Snowflake();

  public static generateSnowflake() {
    return this.snowflake.generateSnowflake();
  }

  public static generateSecret(length: number) {
    const buffer = crypto.randomBytes(Math.ceil(length / 2));
    return buffer.toString("hex").slice(0, length);
  }

  public static async generateToken(data: TokenData) {
    return `${Buffer.from(data.id).toString("base64url")}.${Buffer.from(
      data.timestamp.toString()
    ).toString("base64url")}.${Buffer.from(data.secret).toString("base64url")}`;
  }
  
  public static generatePaddedTag(tag: number) {
    const str = tag.toString();
    const paddedStr = str.padStart(4, "0");
    return paddedStr;
  }
}
