exports.error = (res, err, code = 500) => {
  console.error("🔥 Error:", err);

  return res.status(code).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

exports.success = (res, data, message = "Success", code = 200) => {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
};
