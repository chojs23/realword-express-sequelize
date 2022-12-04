const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/users");
const { protect } = require("../middlewares/auth");

router.post("/users", createUser);
router.post("/users/login", loginUser);
router.get("/user", protect, getCurrentUser);

module.exports = router;
