const mongoose = require("mongoose");
const Property = require("../models/Property");
const cloudinary = require("../middleware/cloudinary");
const deleteCloudinaryImage = require("../middleware/deleteFile");
const { success, error } = require("../utils/responseHandler");

// Utility
const extractFilename = (path) => (path ? path.split("\\").pop().split("/").pop() : null);
const getImageUrl = (filename) => cloudinary.url(filename, { secure: true });

// CREATE PROPERTY
// ========================================
const createProperty = async (req, res) => {
  try {
    let data = { ...req.body };

    // Parse JSON fields
    ["details", "location", "features", "amenities", "owner"].forEach((key) => {
      if (typeof data[key] === "string") {
        try {
          data[key] = JSON.parse(data[key]);
        } catch (err) {
          return error(res, new Error(`Invalid ${key} format`), 400);
        }
      }
    });

    // Uploaded images (Cloudinary)
    const uploadedImages = req.files?.map((file) => file.filename) || [];
    if (uploadedImages.length === 0)
      return error(
        res,
        new Error("At least one property image is required"),
        400
      );

    data.propertyImages = uploadedImages;
    data.createdBy = req.user._id;

    // -------------------------------
    // APPROVAL LOGIC
    // -------------------------------
    if (req.user.role === "superAdmin") {
      // SuperAdmin auto-approves their own properties
      data.approvalStatus = "approved";
      data.approvedBy = req.user._id;
    } else {
      // Admin and Seller both create as "pending"
      data.approvalStatus = "pending";
      data.approvedBy = null;
    }
    // -------------------------------

    const property = await Property.create(data);
    return success(res, property, "Property created successfully", 201);
  } catch (err) {
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return error(res, new Error(errors.join(", ")), 400);
    }

    return error(res, err, 500);
  }
};

// ========================================
// UPDATE PROPERTY
// ========================================
const updateProperty = async (req, res) => {
  try {
    req.uploadFolder = "properties";
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) return error(res, new Error("Property not found"), 404);

    // Only creator OR admin/superAdmin can update
    if (
      req.user.role !== "superAdmin" &&
      req.user.role !== "admin" &&
      property.createdBy.toString() !== req.user._id.toString()
    ) {
      return error(res, new Error("Unauthorized access"), 403);
    }

    let data = { ...req.body };

    // Parse JSON
    ["details", "location", "features", "amenities", "owner"].forEach((key) => {
      if (typeof data[key] === "string") data[key] = JSON.parse(data[key]);
    });

    const oldImages = Array.isArray(data.existingImages)
      ? data.existingImages
      : data.existingImages
        ? [data.existingImages]
        : [];

    const newImages =
      req.files?.map((file) => file.path || file.secure_url) || [];
    data.propertyImages = [...oldImages, ...newImages];
    delete data.existingImages;

    // -----------------------------------------
    // APPROVAL LOGIC - FIXED
    // -----------------------------------------
    if (req.user.role === "superAdmin") {
      // SuperAdmin → always approved
      data.approvalStatus = "approved";
      data.approvedBy = req.user._id;
    } else if (req.user.role === "admin") {
      // Admin updating their own property
      if (property.createdBy.toString() === req.user._id.toString()) {
        // If already approved, keep it approved
        if (property.approvalStatus === "approved") {
          data.approvalStatus = "approved";
          data.approvedBy = property.approvedBy; // Keep original approver
        } else {
          // If pending/rejected → stays pending
          data.approvalStatus = "pending";
          data.approvedBy = null;
        }
      } else {
        // Admin updating someone else's property (seller's)
        // Keep current approval status (admin can't auto-approve others)
        data.approvalStatus = property.approvalStatus;
        data.approvedBy = property.approvedBy;
      }
    } else if (req.user.role === "seller") {
      // Seller updating their own property
      if (property.approvalStatus === "approved") {
        // If already approved, keep it approved
        data.approvalStatus = "approved";
        data.approvedBy = property.approvedBy; // Keep original approver
      } else {
        // If pending/rejected → stays pending
        data.approvalStatus = "pending";
        data.approvedBy = null;
      }
    }
    // -----------------------------------------

    Object.assign(property, data);
    await property.save();

    return success(res, property, "Property updated successfully");
  } catch (err) {
    return error(res, err, 500);
  }
};

// ========================================
// UPDATE APPROVAL STATUS 
// ========================================
const updateApprovalStatus = async (req, res) => {
  try {
    const { approvalStatus } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus))
      return error(res, new Error("Invalid approval status"), 400);

    const property = await Property.findById(req.params.id)
      .populate("createdBy", "role fullname");

    if (!property) return error(res, new Error("Property not found"), 404);

    const creatorRole = property.createdBy.role;

    // Role-based approval logic
    if (req.user.role === "seller") {
      return error(res, new Error("Seller cannot approve properties"), 403);
    }

    if (req.user.role === "admin") {
      // Admin can only approve Seller properties
      if (creatorRole !== "seller") {
        return error(res, new Error("Admin can approve only Seller properties"), 403);
      }
    }

    if (req.user.role === "superAdmin") {
      // SuperAdmin can approve Admin and Seller properties
      if (!["admin", "seller"].includes(creatorRole)) {
        return error(res, new Error("Invalid property creator role"), 403);
      }
    }

    property.approvalStatus = approvalStatus;
    property.approvedBy = req.user._id;
    await property.save();

    return success(
      res,
      {
        propertyId: property._id,
        approvedBy: property.approvedBy,
        createdBy: property.createdBy._id,
        approvalStatus: property.approvalStatus
      },
      `Property ${approvalStatus} successfully`
    );

  } catch (err) {
    return error(res, err, 500);
  }
};

// ========================================
// GET ALL PROPERTIES
// ========================================
const getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      cityId,
      locality,
      propertyType,
      listingType,
      minPrice,
      maxPrice
    } = req.query;

    console.log(req.query);

    // FORCE convert to numbers (important)
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    const skip = (pageNum - 1) * limitNum;


    // ---------- BASIC MATCH (filters) ----------
    const match = {};
    // PRICE FILTER
    if (minPrice && maxPrice) {
      match.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice) {
      match.price = { $gte: Number(minPrice) };
    } else if (maxPrice) {
      match.price = { $lte: Number(maxPrice) };
    }


    if (cityId && mongoose.Types.ObjectId.isValid(cityId)) {
      match["location.cityId"] = new mongoose.Types.ObjectId(cityId);
    }
    if (locality)
      match["location.locality.name"] = { $regex: locality, $options: "i" };

    if (propertyType) match.propertyType = propertyType;
    if (listingType) match.listingType = listingType;

    // ---------- BASE PIPELINE ----------
    const basePipeline = [
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByData",
        },
      },
      { $unwind: { path: "$createdByData", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "cities",
          localField: "location.cityId",
          foreignField: "_id",
          as: "cityData",
        },
      },
      { $unwind: { path: "$cityData", preserveNullAndEmptyArrays: true } },

      { $addFields: { createdByRole: "$createdByData.role" } },

      { $match: match },
    ];

    // ---------- ROLE LOGIC - FIXED ----------
    const role = req.user.role;

    if (role === "seller") {
      // Seller → sees only their own properties (all statuses)
      basePipeline.push({
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.user._id),
          approvalStatus: { $in: ["pending", "approved", "rejected"] },
        },
      });
    }
    else if (role === "admin") {
      // Admin → sees:
      // 1. Their own properties (pending, approved, rejected)
      // 2. Sellers' pending properties
      basePipeline.push({
        $match: {
          $or: [
            {
              // Admin's own properties (all statuses)
              createdBy: new mongoose.Types.ObjectId(req.user._id),
              approvalStatus: { $in: ["pending", "approved", "rejected"] },
            },
            {
              // Sellers' pending properties
              createdByRole: "seller",
              approvalStatus: "pending",
            },
          ],
        },
      });
    }
    else if (role === "superAdmin") {
      // SuperAdmin → sees ALL properties (no filter)
      basePipeline.push({ $match: {} });
    }
    else {
      // Public → only approved properties
      basePipeline.push({ $match: { approvalStatus: "approved" } });
    }

    // ---------- COUNT ----------
    const totalResult = await Property.aggregate([
      ...basePipeline,
      { $count: "total" },
    ]);

    const totalProperties = totalResult[0]?.total || 0;

    // ---------- FINAL FETCH ----------
    const properties = await Property.aggregate([
      ...basePipeline,

      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          listingType: 1,
          propertyType: 1,
          details: 1,
          location: 1,
          saleOutDate: 1,
          propertyImages: 1,
          features: 1,
          amenities: 1,
          owner: 1,
          status: 1,
          approvalStatus: 1,
          postedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          approvedBy: 1,
          city: "$cityData.name",
          locality: "$location.locality.name",
          createdBy: {
            _id: "$createdByData._id",
            name: "$createdByData.fullname",
            email: "$createdByData.email",
            role: "$createdByData.role",
          },
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    // ---------- IMAGE URL FIX ----------
    properties.forEach((p) => {
      p.propertyImages = p.propertyImages?.map((img) => getImageUrl(img));
    });

    // ---------- RESPONSE ----------
    return success(res, {
      message: "Properties fetched successfully",
      properties,
      totalProperties,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProperties / limit),
      hasNextPage: page * limit < totalProperties,
      hasPrevPage: page > 1,
    });

  } catch (err) {
    return error(res, err, 500);
  }
};


// ✅ GET Single Property
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("location.cityId", "name state")
      .populate("createdBy", "fullname email mobile role")
      .populate("approvedBy", "fullname email role");

    if (!property) return error(res, new Error("Property not found"), 404);

    const propertyObj = property.toObject();
    propertyObj.propertyImages = propertyObj.propertyImages?.map((img) => getImageUrl(img));

    return success(res, propertyObj, "Property fetched successfully");
  } catch (err) {
    return error(res, err, 500);
  }
};

// ✅ DELETE Property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return error(res, new Error("Property not found"), 404);

    // ✅ Only Superadmin can delete property
    if (req.user.role !== "superAdmin") {
      return error(res, new Error("Only superAdmin can delete properties"), 403);
    }

    // Delete all images from Cloudinary before deleting the property
    if (property.propertyImages?.length > 0) {
      for (const img of property.propertyImages) {
        await deleteCloudinaryImage(img);
      }
    }

    await property.deleteOne();

    return success(res, property._id, "Property deleted successfully by Superadmin");
  } catch (err) {
    return error(res, err, 500);
  }
};


// ✅ GET all Localities by City (for dropdown)
const getLocalitiesByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    const localities = await Property.aggregate([
      {
        $match: {
          "location.cityId": new mongoose.Types.ObjectId(cityId),
          approvalStatus: "approved" // Only show localities with approved properties
        }
      },
      {
        $group: {
          _id: "$location.locality.name",
          latitude: { $first: "$location.locality.latitude" },
          longitude: { $first: "$location.locality.longitude" },
          count: { $sum: 1 }
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          latitude: 1,
          longitude: 1,
          propertyCount: "$count"
        },
      },
      { $sort: { name: 1 } }
    ]);

    return success(res, localities, "Localities fetched successfully");
  } catch (err) {
    return error(res, err, 500);
  }
};

// ✅ FILTER by City & Locality
// const getPropertiesByCityLocality = async (req, res) => {
//   try {
//     const { cityId, locality, page = 1, limit = 10 } = req.query;

//     const filter = { approvalStatus: "approved" }; // Only approved for public

//     if (cityId) filter["location.cityId"] = cityId;
//     if (locality) filter["location.locality.name"] = locality;

//     const skip = (page - 1) * limit;

//     const properties = await Property.find(filter)
//       .populate("location.cityId", "name state")
//       .populate("createdBy", "name")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Property.countDocuments(filter);

//     // Convert images
//     const propertiesWithImages = properties.map((p) => {
//       const pObj = p.toObject();
//       pObj.propertyImages = pObj.propertyImages?.map((img) => getImageUrl(img));
//       return pObj;
//     });

//     return success(res, {
//       properties: propertiesWithImages,
//       totalCount,
//       currentPage: Number(page),
//       totalPages: Math.ceil(totalCount / limit),
//     }, "Properties fetched successfully");
//   } catch (err) {
//     return error(res, err, 500);
//   }
// };



module.exports = {
  createProperty,
  updateProperty,
  getAllProperties,
  getPropertyById,
  deleteProperty,
  updateApprovalStatus,
  getLocalitiesByCity,
  // getPropertiesByCityLocality,
};