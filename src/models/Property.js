const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    listingType: { type: String, enum: ["Sale", "Rent"], required: true },
    propertyType: {
      type: String,
      enum: ["Apartment", "House", "Villa", "Farm House", "Commercial"],
      required: true,
    },

    details: {
      whichType: { type: String, enum: ["Plot", "Duplex"] ,default: null},
      villaType: { type: String, enum: ["Magenta", "Green", "Gray", "Orange"],default: null },
      plotSize: { type: String },
      plotNumber: { type: Number },
      totalArea: { type: Number },
      builtUpArea: { type: Number },
      carpetArea: { type: Number },
      pricePerSqFt: { type: Number },
      workspaces: { type: Number },
      meetingRooms: { type: Number },
      floors: { type: Number },
    },

    location: {
      cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
      locality:{
        name: { type: String, required: true  },
        latitude: { type: String },
        longitude: { type: String },
      },
    },
    saleOutDate: { type: Date }, 
    propertyImages: [{ type: String, required: true }],
    category: { type: String, required: true },
    propertyId: { type: String , required: true },
    features: {
      parking: { type: Boolean, default: false },
      powerBackup: { type: Boolean, default: false },
      lift: { type: Boolean, default: false },
      securityCCTV: { type: Boolean, default: false },
      flooringType: { type: String, enum: ["Tiles", "Marble", "Concrete"] },
      roadAccess: { available: { type: Boolean, default: false }, widthFt: { type: Number } },
      legalStatus: { type: String, enum: ["Clear", "Under Dispute", "Encumbrances"], default: "Clear" },
    },

    amenities: [{
      type: String,
      enum: ["restrooms", "storage", "loadingFacility", "fireSafety", "airConditioning"]
    }],

    owner: { name: { type: String } },
    status: { type: String, enum: ["Available", "Sold", "Rented"], default: "Available" },
    // category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    // subCategory: { type: [String], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);


