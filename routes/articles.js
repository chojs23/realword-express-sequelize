const express = require("express");
const router = express.Router();
const {
  getArticles,
  createArticle,
  articlesFeed,
} = require("../controllers/articles");
const { protect } = require("../middlewares/auth");

router.route("/articles").get(getArticles).post(protect, createArticle);
router.route("/articles/feed").get(protect, articlesFeed);

module.exports = router;
