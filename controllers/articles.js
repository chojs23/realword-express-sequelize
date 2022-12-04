const { where } = require("sequelize");
const asyncHandler = require("../middlewares/asyncHandler");
const Article = require("../models/Article");
const Tag = require("../models/Tag");
const User = require("../models/User");
const ErrorResponse = require("../util/errorResponse");

module.exports.getArticles = asyncHandler(async (req, res, next) => {
  const { tag, author, favorited, limit = 20, offset = 0 } = req.query;

  let favoritedUser;
  if (favorited) {
    const favoritedUser = await User.findOne({
      where: { username: favorited },
    });
  }

  let articles;

  articles = await Article.findAll({
    include: [
      {
        model: Tag,
        attributes: ["name"],
        where: req.query.tag ? { tag: req.query.tag } : {},
      },
      {
        model: User,
        as: "author",
        attributes: ["username", "bio", "image"],
        where: req.query.author ? { username: req.query.author } : {},
      },
    ],
  });

  const articlesCount = articles.length;

  let respondArticles = [];
  for (let article of articles) {
    if (!req.user) {
      article.dataValues.favorited = false;
    } else {
      article.dataValues.favorited = await article.hasFavorited(req.user.id);
    }
    const user = await article.getAuthor();

    let isFollowing = false;
    if (req.user) {
      const followers = await user.getFollowers();
      isFollowing = followers.some((user) => user.id === req.user.id);
    }
    user.dataValues.following = isFollowing;

    article = await sanitizeOutput(article, user);
    respondArticles.push(article);
  }
  articles = respondArticles;

  res.status(200).json({ articles, articlesCount });
});

module.exports.createArticle = async (req, res, next) => {
  fieldValidation(req.body.article.title, next);
  fieldValidation(req.body.article.description, next);
  fieldValidation(req.body.article.body, next);

  const data = {
    title: req.body.article.title,
    description: req.body.article.description,
    body: req.body.article.body,
    tagList: req.body.article.tagList,
  };

  //Find out author object
  const user = await User.findByPk(req.user.id);
  if (!user) next(new ErrorResponse("User does not exist"));

  let isFollowing = false;
  if (req.user) {
    const followers = await user.getFollowers();
    isFollowing = followers.some((user) => user.id === req.user.id);
  }
  user.dataValues.following = isFollowing;

  let article = await Article.create({
    title: data.title,
    description: data.description,
    body: data.body,
    authorId: user.id,
  });

  if (data.tagList) {
    for (let t of data.tagList) {
      let tagExists = await Tag.findByPk(t);
      let newTag;
      if (!tagExists) {
        newTag = await Tag.create({ name: t });
        await article.addTag(newTag);
      } else {
        await article.addTag(tagExists);
      }
    }
  }

  article = await Article.findByPk(article.id, {
    include: [{ model: Tag, attributes: ["name"] }],
  });

  if (!req.user) {
    article.dataValues.favorited = false;
  } else {
    article.dataValues.favorited = await article.hasFavorited(req.user.id);
  }
  article = await sanitizeOutput(article, user);
  res.status(201).json({ article });
};

const fieldValidation = (field, next) => {
  if (!field) {
    return next(new ErrorResponse(`Missing fields`, 400));
  }
};

async function sanitizeOutput(article, user) {
  const newTagList = [];
  for (let t of article.dataValues.Tags) {
    newTagList.push(t.name);
  }
  const favoritesCount = await article.countFavorited();

  delete article.dataValues.Tags;
  article.dataValues.tagList = newTagList;
  article.dataValues.favoritesCount = favoritesCount;
  if (article) {
    delete user.dataValues.id;
    delete user.dataValues.password;
    delete user.dataValues.email;

    article.dataValues.author = user;
    return article;
  }
}
