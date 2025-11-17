const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, default: "Madhya Pradesh" },
  country: { type: String, default: "India" },
  latitude: { type: String },
  longitude: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
