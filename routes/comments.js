const express = require("express");
const router = express.Router();

const {
  getComment,
  getComments,
  createComment,
  deleteComment,
} = require("../controllers/comments");

const { protect } = require("../middlewares/auth");

router
  .route("/articles/:slug/comments")
  .get(protect, getComments)
  .post(protect, createComment);

router
  .route("/articles/:slug/comments/:id")
  .get(protect, getComment)
  .delete(protect, deleteComment);

module.exports = router;
