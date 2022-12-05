const express = require("express");
const router = express.Router();
const {
  getArticle,
  getArticles,
  createArticle,
  articlesFeed,
  addFavoriteArticle,
  deleteFavoriteArticle,
  deleteArticle,
  updateArticle,
} = require("../controllers/articles");
const { protect } = require("../middlewares/auth");

router
  .route("/articles")
  .get(protect, getArticles)
  .post(protect, createArticle);
router
  .route("/articles/:slug")
  .get(protect, getArticle)
  .put(protect, updateArticle)
  .delete(protect, deleteArticle);
router
  .route("/articles/:slug/favorite")
  .post(protect, addFavoriteArticle)
  .delete(protect, deleteFavoriteArticle);
router.route("/articles/feed").get(protect, articlesFeed);

module.exports = router;
