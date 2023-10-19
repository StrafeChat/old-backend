import bodyParser from "body-parser";
import express, { Router } from "express";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
const app = express();

dotenv.config();

app.use(bodyParser.json());

for (const routeName of fs.readdirSync("src/routes")) {
  const route: Router = require(`./routes/${routeName}`).default;
  app.use(`/${routeName.replace(".ts", "")}`, route);
}

app.listen(process.env.PORT!, () => {
  mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => {
      console.log(`Listening on port ${process.env.PORT}`);
    })
    .catch((err) => {
      console.error(
        `Something went wrong when trying to connect to the database: ${err}`
      );
    });
});
