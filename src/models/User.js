const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, sparse: true },
    fullname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // Make password optional for Google users
    password: {
      type: String,
      required: function () { return !this.isGoogleUser; }
    },

    // Make mobile optional for Google users
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      required: function () { return !this.isGoogleUser; },
    },
    role: {
      type: String,
      enum: ["seller", "buyer", "admin", "superAdmin"],
      default: "buyer",
    },
    isGoogleUser: { type: Boolean, default: false },
    profileImg: { type: String, required: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate JWT Token
userSchema.methods.generateAuthToken = function () {
  const accessToken = jwt.sign(
    { id: this._id, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  return accessToken;
};

module.exports = mongoose.model("User", userSchema);
