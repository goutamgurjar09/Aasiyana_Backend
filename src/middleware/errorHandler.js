// src/middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(JSON.stringify(err, null, 2)); // <-- change this line

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: err,
  });
};
