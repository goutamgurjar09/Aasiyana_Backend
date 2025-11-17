const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");
const notificationController = require("../controllers/SmsController");
const upload = require("../middleware/uploadFile");
const {
  validateSignup,
  validateLogin,
  validateResetPassword,
} = require("../middleware/useValidations");
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Signup with profile image upload
router.post(
  "/signup",
  upload.uploadSingle("users", "profileImg"),
  validateSignup,
  userController.signup
);

// ✅ Login
router.post("/login", validateLogin, userController.login);

// ✅ Google Login
router.post("/google-login", userController.googleAuth);

// ✅ OTP generation
router.post("/generate-otp", userController.generateOtp);

// ✅ Reset Password
router.post(
  "/reset-password",
  userController.resetPassword
);

// ✅ Get all users (superAdmin only)
router.get(
  "/users",
  accessTokenVerify,
  authorizeRoles("superAdmin"),
  userController.getUsers
);

// ✅ Get single user by ID
router.get(
  "/users/:id",
  accessTokenVerify,
  userController.getUserById
);

// ✅ Update user (profile image)
router.patch(
  "/users/:id",
  accessTokenVerify,
  upload.uploadSingle("users", "profileImg"), 
  userController.updateUser
);

// ✅ Delete user 
router.delete(
  "/users/:id",
  accessTokenVerify,
  authorizeRoles("superAdmin"),
  userController.deleteUser
);

// ✅ Send SMS (authenticated)
router.post(
  "/send-sms",
  accessTokenVerify,
  notificationController.sendSmsToMobile
);

// ✅ Update user role (admin only)
router.patch(
  "/update/user-role",
  accessTokenVerify,
  authorizeRoles("superAdmin"),
  userController.updateUserRole
);
router.post("/logout", userController.logout);

module.exports = router;
