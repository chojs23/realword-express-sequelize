const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

const Comment = sequelize.define("Comment", {
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Comment;
