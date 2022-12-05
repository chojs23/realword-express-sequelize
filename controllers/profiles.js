const User = require("../models/User");
const asyncHandler = require("../middlewares/asyncHandler");
const ErrorResponse = require("../util/errorResponse");

module.exports.getProfile = asyncHandler(async (req, res, next) => {
  const username = req.params.username;
  const { loggedUser } = req;
  const user = await User.findOne({ where: { username: username } });

  if (!user) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  let isFollowing = false;

  if (loggedUser) {
    const followers = await user.getFollowers();
    isFollowing = followers.some((user) => user.id === loggedUser.id);
  }

  const profile = {
    username,
    bio: user.bio,
    image: user.image,
    following: isFollowing,
  };
  res.status(200).json({ profile });
});

module.exports.followUser = asyncHandler(async (req, res, next) => {
  const username = req.params.username;
  const { loggedUser } = req;
  const userToFollow = await User.findOne({ where: { username: username } });

  if (!userToFollow) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  const currentUser = await User.findByPk(loggedUser.id);

  await userToFollow.addFollower(currentUser);

  const profile = {
    username: username,
    bio: userToFollow.dataValues.bio,
    image: userToFollow.dataValues.image,
    following: true,
  };

  res.status(200).json({ profile });
});

module.exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const username = req.params.username;
  const { loggedUser } = req;
  const userToUnfollow = await User.findOne({ where: { username: username } });

  if (!userToUnfollow) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  const currentUser = await User.findByPk(loggedUser.id);

  await userToUnfollow.removeFollower(currentUser);

  const profile = {
    username: username,
    bio: userToUnfollow.dataValues.bio,
    image: userToUnfollow.dataValues.image,
    following: false,
  };

  res.status(200).json({ profile });
});
