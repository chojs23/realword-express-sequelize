const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/User");

module.exports.createUser = asyncHandler(async (req, res, next) => {
  const { email, password, username } = req.body.user;

  if (!email) {
    return next(new ErrorResponse(`Email is required`, 400));
  }
  if (!password) {
    return next(new ErrorResponse(`Password is required`, 400));
  }
  if (!username) {
    return next(new ErrorResponse(`Username is required`, 400));
  }

  const user = await User.create({
    email: email,
    password: password,
    username: username,
  });

  if (user.dataValues.password) {
    delete user.dataValues.password;
  }

  res.status(201).json(user.toJSON());
});
