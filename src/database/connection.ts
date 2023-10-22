import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_DATABASE,
  dialect: "postgres",
  host: process.env.DB_HOST,
  models: [__dirname + "/models"],
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER,
});

export default sequelize;