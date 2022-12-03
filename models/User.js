const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");
const bcrypt = require("bcryptjs");

/**
 * "email": "jake@jake.jake",
    "token": "jwt.token.here",
    "username": "jake",
    "bio": "I work at statefarm",
    "image": null
 */

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // token: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  // },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

const DEFAULT_SALT_ROUNDS = 10;

User.addHook("beforeCreate", async (user) => {
  const encryptedPassword = await bcrypt.hash(
    user.password,
    DEFAULT_SALT_ROUNDS
  );
  user.password = encryptedPassword;
});

module.exports = User;
