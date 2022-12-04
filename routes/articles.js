const express = require("express");
const router = express.Router();
const { getArticles, createArticle } = require("../controllers/articles");
const { protect } = require("../middlewares/auth");

router.route("/articles").get(getArticles).post(protect, createArticle);

module.exports = router;
