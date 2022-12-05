const Comment = require("../models/Comment");
const Article = require("../models/Article");
const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");
const { appendFollowers } = require("../util/helpers");
const ErrorResponse = require("../util/errorResponse");

module.exports.getComments = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const { loggedUser } = req;

  const article = await Article.findOne({
    where: { slug: slug },
  });

  if (!article) return next(new ErrorResponse("Article not found", 404));

  const comments = await article.getComments({
    include: [
      {
        model: User,
        as: "author",
        attributes: ["username", "bio", "image"],
      },
    ],
  });

  for (let comment of comments) {
    await appendFollowers(loggedUser, comment);
  }

  res.status(200).json({ comments });
});

module.exports.getComment = asyncHandler(async (req, res, next) => {
  const { slug, id } = req.params;
  const { loggedUser } = req;

  const article = await Article.findOne({
    where: { slug: slug },
  });

  if (!article) return next(new ErrorResponse("Article not found", 404));

  const comment = await Comment.findOne({
    where: { id: id },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["username", "bio", "image"],
      },
    ],
  });
  if (!comment) return next(new ErrorResponse("Comment not found", 404));

  await appendFollowers(loggedUser, comment);

  res.status(200).json({ comment });
});

module.exports.createComment = asyncHandler(async (req, res, next) => {
  const { body } = req.body.comment;
  const { slug } = req.params;
  const { loggedUser } = req;

  fieldValidation(body, next);

  const article = await Article.findOne({
    where: { slug: slug },
    include: [
      { model: User, as: "author", attributes: ["username", "bio", "image"] },
    ],
  });

  if (!article) return next(new ErrorResponse("Article not found", 404));

  const comment = await Comment.create({
    body: body,
    articleId: article.id,
    authorId: loggedUser.id,
  });

  delete loggedUser.dataValues.token;
  await appendFollowers(loggedUser, loggedUser);

  comment.dataValues.author = loggedUser;

  res.status(201).json({ comment });
});

module.exports.deleteComment = asyncHandler(async (req, res, next) => {
  const { slug, id } = req.params;
  const { loggedUser } = req;

  const article = await Article.findOne({
    where: { slug: slug },
  });

  if (!article) return next(new ErrorResponse("Article not found", 404));

  const comment = await Comment.findOne({
    where: { id: id },
  });

  if (!comment) return next(new ErrorResponse("Comment not found", 404));

  if (comment.authorId !== loggedUser.id)
    return next(new ErrorResponse("Unauthorized", 401));

  await comment.destroy();

  res.status(200).json({ comment });
});

const fieldValidation = (field, next) => {
  if (!field) {
    return next(new ErrorResponse(`Missing fields`, 400));
  }
};
