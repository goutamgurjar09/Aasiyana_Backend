const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: {
      type: String,
      unique: true,
      required: true
    },    
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Customer", customerSchema);