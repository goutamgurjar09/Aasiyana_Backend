const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendSms } = require("../utils/SendSms");
const Otp = require("../models/Otp");
const { success, error } = require("../utils/responseHandler");
const cloudinary = require("../middleware/cloudinary");
const deleteCloudinaryImage = require("../middleware/deleteFile");

// Helper to get filename only
const extractFilename = (urlOrFilename) =>
  urlOrFilename?.includes("/") ? urlOrFilename.split("/").pop() : urlOrFilename;

// Helper to get full Cloudinary URL
const getCloudinaryUrl = (folder, filename) =>
  filename ? cloudinary.url(`uploads/${folder}/${filename}`, { secure: true }) : null;

// ---------------- SIGNUP ----------------
exports.signup = async (req, res) => {
  try {
    req.uploadFolder = "users"; // folder for Cloudinary

    const { fullname, email, password, mobile, role } = req.body;
    const profileImg = req.file ? extractFilename(req.file.path) : null;

    const existingUser = await User.findOne({ email });
    if (existingUser) return error(res, "User already exists", 400);

    const newUser = await User.create({ fullname, email, password, mobile, role, profileImg });

    success(res, { userId: newUser._id }, "User registered successfully", 201);
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return error(res, "Invalid credentials", 400);
    // Check if active
    if (user.status != 'active') {
      return error(res, new Error("Your account has been deactivated"), 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, "Invalid credentials", 400);

    const token = user.generateAuthToken();
    res.cookie("accessToken", token, { httpOnly: true, secure: true, sameSite: "None", maxAge: 24 * 60 * 60 * 1000 });

    const data = {
      userId: user._id,
      full_name: user.fullname,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      profileImg: getCloudinaryUrl("users", user.profileImg),
      accessToken: token,
    };

    success(res, data, "User logged in successfully");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};
// ---------------- GENERATE OTP ----------------

exports.generateOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return error(res, "Mobile number is required", 400);

    const user = await User.findOne({ mobile });
    if (!user) return error(res, "User not found", 404);

    const existingOtp = await Otp.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (existingOtp && existingOtp.expiresAt > new Date()) {
      return error(res, "An OTP has already been sent.", 400);
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await Otp.deleteMany({ userId: user._id });
    await Otp.create({
      userId: user._id,
      mobile: user.mobile,
      otp_number: otp,
      expiresAt,
    });

    const message = `🔐 Your OTP is: ${otp}. It will expire in 3 minutes. Do not share it with anyone.`;
    // Format number properly
    const formattedMobile = user.mobile.startsWith('+') ? user.mobile : `+91${user.mobile}`;

    // Log cleanly (for debugging)
    console.log("📞 Sending OTP to:", formattedMobile);

    await sendSms(formattedMobile, message);
    return success(
      res,
      { otp_send: true, mobile: user.mobile, expires_in: 180 },
      "OTP sent successfully via SMS"
    );
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};

// ---------------- RESET PASSWORD ----------------

exports.resetPassword = async (req, res) => {
  try {
    const { mobile, newPassword, otp_number } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return error(res, "User not found", 400);

    const otpRecord = await Otp.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!otpRecord) return error(res, "No OTP found. Please request again.", 400);
    if (Date.now() > otpRecord.expiresAt) return error(res, "OTP expired. Please request a new one.", 400);
    if (otpRecord.otp_number !== otp_number) return error(res, "Invalid OTP. Please try again.", 400);

    user.password = newPassword;
    await user.save();

    success(res, { userId: user._id }, "Password reset successfully");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};


// ---------------- GOOGLE AUTH ----------------
exports.googleAuth = async (req, res) => {
  try {
    const { tokenId } = req.body;

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    // If user doesn't exist, create with default role 'buyer'
    if (!user) {
      user = new User({
        fullname: name,
        email,
        role: "buyer", // default role
        profileImg: picture,
        isGoogleUser: true,
      });
      await user.save();
    }
    const token = user.generateAuthToken();

    res.cookie("accessToken", token, { httpOnly: true, secure: true, sameSite: "None", maxAge: 24 * 60 * 60 * 1000 });


    // Prepare response data
    const data = {
      userId: user._id,
      full_name: user.fullname,
      email: user.email,
      role: user.role,
      mobile: user.mobile || null,
      profileImg: user.profileImg
        ? getCloudinaryUrl("users", user.profileImg)
        : null,
      isGoogleUser: true,
      accessToken: token
    };

    success(res, data, "Google login successful");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};


// ---------------- GET USERS ----------------
exports.getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, role } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let filter = {};
    if (role) filter.role = role;
    if (search)
      filter.$or = [
        { fullname: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
      ];

    const totalUsers = await User.countDocuments(filter);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const usersWithUrls = users.map((u) => {
      const obj = u.toObject();
      obj.profileImg = getCloudinaryUrl("users", obj.profileImg);
      return obj;
    });

    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    success(res,
      {
        users: usersWithUrls,
        totalUsers,
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      "Users retrieved successfully"
    );
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};


// ---------------- GET SINGLE USER ----------------
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, "User not found", 404);

    const userObj = user.toObject();
    userObj.profileImg = getCloudinaryUrl("users", userObj.profileImg);

    success(res, userObj, "User retrieved successfully");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};

// ---------------- UPDATE USER ----------------
exports.updateUser = async (req, res) => {
  try {
    req.uploadFolder = "users";

    const { fullname, email, mobile } = req.body;
    const updates = { fullname, email, mobile };

    if (req.file?.path) {
      const newFileName = req.file.path.split("/").pop();

      const user = await User.findById(req.params.id);
      if (user?.profileImg) await deleteCloudinaryImage(`uploads/users/${user.profileImg}`);

      updates.profileImg = newFileName;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updatedUser) return error(res, "User not found", 404);

    success(res, { user: updatedUser._id }, "User updated successfully");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};

// ---------------- DELETE USER ----------------
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, "User not found", 404);

    if (user.profileImg) await deleteCloudinaryImage(`uploads/users/${user.profileImg}`);
    await user.deleteOne();

    success(res, { user: user._id }, "User deleted successfully");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};

// ---------------- UPDATE USER ROLE ----------------
exports.updateUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
    if (!updatedUser) return error(res, "User not found", 404);

    success(res, updatedUser, "User role updated successfully");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};

exports.logout = async (req, res) => {
  try {
    // Clear the access token cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // set secure in production
      sameSite: "Strict",
    });

    success(res, null, "User logged out successfully");
  } catch (err) {
    error(res, err.message || "Server Error", 500);
  }
};
