const jwt = require("jsonwebtoken");

module.exports.sign = async (user) => {
  const token = await jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET
  );
  return token;
};

module.exports.verify = async (token) => {
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};
