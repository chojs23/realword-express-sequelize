const { where } = require("sequelize");
const asyncHandler = require("../middlewares/asyncHandler");
const Article = require("../models/Article");
const Tag = require("../models/Tag");
const User = require("../models/User");
const ErrorResponse = require("../util/errorResponse");
const slugify = require("slugify");

const {
  appendFollowers,
  appendFavorites,
  appendTagList,
} = require("../util/helpers");

const includeOptions = [
  {
    model: Tag,
    as: "tagLists",
    attributes: ["name"],
    through: { attributes: [] },
  },
  { model: User, as: "author", attributes: { exclude: ["email", "password"] } },
];

module.exports.getArticles = asyncHandler(async (req, res, next) => {
  const { tag, author, favorited, limit = 20, offset = 0 } = req.query;
  const { loggedUser } = req;

  const searchOptions = {
    include: [
      {
        model: Tag,
        as: "tagLists",
        attributes: ["name"],
        through: { attributes: [] }, // ? this will remove the rows from the join table
        // where: tag ? { name: tag } : {},
        ...(tag && { where: { name: tag } }),
      },
      {
        model: User,
        as: "author",
        attributes: { exclude: ["password", "email"] },
        // where: author ? { username: author } : {},
        ...(author && { where: { username: author } }),
      },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
    distinct: true,
  };

  let articles = { rows: [], count: 0 };

  if (favorited) {
    const user = await User.findOne({ where: { username: favorited } });

    articles.rows = await user.getFavorites(searchOptions);
    articles.count = await user.countFavorites();
  } else {
    articles = await Article.findAndCountAll(searchOptions);
  }

  for (let article of articles.rows) {
    const articleTags = await article.getTagLists();
    // const articleTags = article.tagLists;
    appendTagList(articleTags, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    delete article.dataValues.Favorites;
  }

  res
    .status(200)
    .json({ articles: articles.rows, articlesCount: articles.count });
});

module.exports.createArticle = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;

  fieldValidation(req.body.article.title, next);
  fieldValidation(req.body.article.description, next);
  fieldValidation(req.body.article.body, next);

  const { title, description, body, tagList } = req.body.article;
  const slug = slugify(title, { lower: true });
  const slugInDB = await Article.findOne({ where: { slug: slug } });
  if (slugInDB) next(new ErrorResponse("Title already exists", 400));

  const article = await Article.create({
    title: title,
    description: description,
    body: body,
  });

  for (const tag of tagList) {
    const tagInDB = await Tag.findByPk(tag.trim());

    if (tagInDB) {
      await article.addTagList(tagInDB);
    } else if (tag.length > 2) {
      const newTag = await Tag.create({ name: tag.trim() });
      await article.addTagList(newTag);
    }
  }
  delete loggedUser.dataValues.token;

  article.dataValues.tagList = tagList;
  article.setAuthor(loggedUser);
  article.dataValues.author = loggedUser;
  await appendFollowers(loggedUser, loggedUser);
  await appendFavorites(loggedUser, article);

  res.status(201).json({ article });
});

module.exports.deleteArticle = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const { loggedUser } = req;

  const article = await Article.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!article) next(new ErrorResponse("Article not found", 404));

  if (article.authorId !== loggedUser.id)
    return next(new ErrorResponse("Unauthorized", 401));

  await article.destroy();

  res.status(200).json({ article });
});

module.exports.articlesFeed = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;

  const { limit = 3, offset = 0 } = req.query;
  const authors = await loggedUser.getFollowing();

  const articles = await Article.findAndCountAll({
    include: includeOptions,
    limit: parseInt(limit),
    offset: offset * limit,
    order: [["createdAt", "DESC"]],
    where: { authorId: authors.map((author) => author.id) },
    distinct: true,
  });

  for (const article of articles.rows) {
    const articleTags = await article.getTagLists();

    appendTagList(articleTags, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);
  }

  res.json({ articles: articles.rows, articlesCount: articles.count });
});

module.exports.getArticle = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;
  const { slug } = req.params;

  const article = await Article.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!article) return next(new ErrorResponse("Article not found", 404));

  const articleTags = await article.getTagLists();
  appendTagList(articleTags, article);
  await appendFollowers(loggedUser, article);
  await appendFavorites(loggedUser, article);

  res.status(200).json({ article });
});

module.exports.addFavoriteArticle = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;
  const { slug } = req.params;

  const article = await Article.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!article) return next(new ErrorResponse("Article not found", 404));

  await loggedUser.addFavorite(article);

  const articleTags = await article.getTagLists();
  appendTagList(articleTags, article);
  await appendFollowers(loggedUser, article);
  await appendFavorites(loggedUser, article);

  res.status(200).json({ article });
});

module.exports.deleteFavoriteArticle = asyncHandler(async (req, res, next) => {
  const { loggedUser } = req;
  const { slug } = req.params;

  const article = await Article.findOne({
    where: { slug: slug },
    include: includeOptions,
  });

  if (!article) return next(new ErrorResponse("Article not found", 404));

  await loggedUser.removeFavorite(article);

  const articleTags = await article.getTagLists();
  appendTagList(articleTags, article);
  await appendFollowers(loggedUser, article);
  await appendFavorites(loggedUser, article);

  res.status(200).json({ article });
});

const fieldValidation = (field, next) => {
  if (!field) {
    return next(new ErrorResponse(`Missing fields`, 400));
  }
};
