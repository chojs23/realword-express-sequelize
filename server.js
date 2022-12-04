const express = require("express");
const sequelize = require("./util/database");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const { errorHandler } = require("./middlewares/errorHandler");

const User = require("./models/User");

dotenv.config({ path: "config.env" });

const app = express();

// Body parser
app.use(express.json());

// Route files
const users = require("./routes/users");
const profiles = require("./routes/profiles");

// Mount routers
app.use(users);
app.use(profiles);

const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

// Relations
User.belongsToMany(User, {
  as: "followers",
  through: "Followers",
  timestamps: false,
  // foreignKey: "followingId",
});

const sync = async () => await sequelize.sync({ force: true });
sync().then(() => {
  User.create({
    email: "test@test.com",
    password: "123456",
    username: "neo",
  });
  User.create({
    email: "test2@test.com",
    password: "123456",
    username: "celeb_neo",
  });
});

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
