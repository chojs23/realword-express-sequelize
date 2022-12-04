const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");

const Tag = sequelize.define(
  "Tag",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
  },
  { timestamps: false }
);

module.exports = Tag;
