const express = require("express");
const sequelize = require("./util/database");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const { errorHandler } = require("./middlewares/errorHandler");

// Import Models
const User = require("./models/User");
const Article = require("./models/Article");
const Tag = require("./models/Tag");

dotenv.config({ path: "config.env" });

const app = express();

// Body parser
app.use(express.json());

// Route files
const users = require("./routes/users");
const profiles = require("./routes/profiles");
const articles = require("./routes/articles");

// Mount routers
app.use(users);
app.use(profiles);
app.use(articles);

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
  foreignKey: "userId",
  timestamps: false,
});
User.belongsToMany(User, {
  as: "following",
  through: "Followers",
  foreignKey: "followerId",
  timestamps: false,
});

User.hasMany(Article, {
  foreignKey: "authorId",
  onDelete: "CASCADE",
});
Article.belongsTo(User, { as: "author", foreignKey: "authorId" });

User.belongsToMany(Article, {
  as: "favorites",
  through: "Favorites",
  timestamps: false,
});
Article.belongsToMany(User, {
  through: "Favorites",
  foreignKey: "articleId",
  timestamps: false,
});

Article.belongsToMany(Tag, {
  through: "TagLists",
  as: "tagLists",
  foreignKey: "articleId",
  timestamps: false,
  onDelete: "CASCADE",
});
Tag.belongsToMany(Article, {
  through: "ArticleTags",
  uniqueKey: false,
  timestamps: false,
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
