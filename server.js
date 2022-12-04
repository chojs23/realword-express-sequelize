const express = require("express");
const sequelize = require("./util/database");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const { errorHandler } = require("./middlewares/errorHandler");

dotenv.config({ path: "config.env" });

const app = express();

// Body parser
app.use(express.json());

// Route files
const users = require("./routes/users");

// Mount routers
app.use(users);

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

const sync = async () => await sequelize.sync({ force: true });
sync();

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
