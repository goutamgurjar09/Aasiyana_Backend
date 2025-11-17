const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { success, error } = require("../utils/responseHandler");

// Middleware to verify access token
const accessTokenVerify = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

  if (!token) {
    return error(res, new Error("Access denied. No token provided."), 401);
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, new Error("User not found"), 404);
    }

    // ✅ Check if user is active
    if (user.status != 'active') {
      return error(res, new Error("Your account has been deactivated"), 403);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, new Error("Token expired"), 401);
    }
    if (err.name === "JsonWebTokenError") {
      return error(res, new Error("Invalid token"), 401);
    }
    return error(res, err, 500);
  }
};

// Role-Based Authorization Middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, new Error("User not authenticated"), 401);
    }

    // ✅ Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return error(
        res,
        new Error(`Access denied. Only ${allowedRoles.join(", ")} can access this resource.`),
        403
      );
    }

    next();
  };
};

module.exports = { accessTokenVerify, authorizeRoles };
