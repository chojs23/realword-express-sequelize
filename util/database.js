const { Sequelize } = require("sequelize");

// Option 1: Passing a connection URI
const sequelize = new Sequelize("conduit", "root", "1234", {
  dialect: "mysql",
  host: "localhost",
});

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

checkConnection();

module.exports = sequelize;
