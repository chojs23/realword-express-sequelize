const { DataTypes, Model } = require("sequelize");
const sequelize = require("../util/database");
const slugify = require("slugify");

const Article = sequelize.define("Article", {
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

Article.beforeValidate((article) => {
  article.slug = slugify(article.title, { lower: true });
});

module.exports = Article;
