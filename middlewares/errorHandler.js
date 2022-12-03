const ErrorResponse = require("../util/errorResponse");

//REQUESTED PAGE IS NOT FOUND
module.exports.notFound = (req, res, next) => {
  const error = new ErrorResponse(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports.errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.log(err.message.red);
  console.log(err.stack.red);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
  });
};
