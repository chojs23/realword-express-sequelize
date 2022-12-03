const express = require("express");
const sequelize = require("./util/database");
const dotenv = require("dotenv");

const app = express();

dotenv.config({ path: "config.env" });

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
