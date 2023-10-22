import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import db from "./database/connection";
import dotenv from "dotenv";
import fs from "fs";

const app = express();

dotenv.config();

app.use(bodyParser.json());
app.use(cors());

for (const routeName of fs.readdirSync("src/routes")) {
  const route: express.Router = require(`./routes/${routeName}`).default;
  app.use(`/${routeName.replace(".ts", "")}`, route);
}

db.sync().then(() => {
  app.listen(process.env.PORT!, async () => {
    console.log(`Listening on port ${[process.env.PORT!]}`);
  });
});