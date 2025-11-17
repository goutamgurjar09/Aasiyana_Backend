const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
      fullname: { type: String, required: true },
      email: { type: String, required: true }, 
      mobile: { type: String, required: true },
      message: { type: String, required: true }, 
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Enquiry", enquirySchema);
  