const SendSms = require("../utils/sendSms");
const Sms = require("../models/Sms");
const { success, error } = require("../utils/responseHandler");

// ✅ Send SMS notification
exports.sendSmsToMobile = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const newSms = await Sms.create({
      message,
      userId,
      sid: process.env.TWILIO_ACCOUNT_SID,
    });

    SendSms(message); // Call the SMS sending function

    success(res, newSms, "SMS sent successfully");
  } catch (err) {
    error(res, err, 500);
  }
};
