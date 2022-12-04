const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getCurrentUser,
  updateUser,
} = require("../controllers/users");
const { protect } = require("../middlewares/auth");

router.post("/users", createUser);
router.post("/users/login", loginUser);

router.route("/user").get(protect, getCurrentUser).put(protect, updateUser);

module.exports = router;
