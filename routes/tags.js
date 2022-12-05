const express = require("express");
const router = express.Router();

const { getTags } = require("../controllers/tags");

const { protect } = require("../middlewares/auth");

router.route("/tags/").get(getTags);

module.exports = router;
