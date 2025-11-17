const mongoose = require("mongoose");

const smsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sid: {
      type: String, // Twilio message SID after successful send
    },
    sentAt: {
      type: Date,
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model("Sms", smsSchema);
