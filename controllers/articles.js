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
        where: tag ? { name: tag } : {},
      },
      {
        model: User,
        as: "author",
        attributes: { exclude: ["password", "email"] },
        where: author ? { username: author } : {},
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
    // const articleTags = await article.getTagLists();
    const articleTags = article.tagLists;
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

const fieldValidation = (field, next) => {
  if (!field) {
    return next(new ErrorResponse(`Missing fields`, 400));
  }
};
