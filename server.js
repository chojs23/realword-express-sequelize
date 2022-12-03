const express = require("express");
const sequelize = require("./util/database");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");

const app = express();

dotenv.config({ path: "config.env" });

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
