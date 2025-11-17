const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadFile"); 
const PropertyController = require("../controllers/PropertyController");
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");
// const { validateProperty, validateUpdateProperty } = require("../middleware/useValidations");
const CityController = require("../controllers/CityController");

router.post(
  "/create-property",
  accessTokenVerify,
  authorizeRoles("admin", "seller","superAdmin"),
  upload.uploadMultiple("properties", "propertyImages", 5),
  // validateProperty,
  PropertyController.createProperty
);
router.get(
  "/properties",
  accessTokenVerify,
  authorizeRoles("superAdmin", "admin", "seller", "buyer"),
  PropertyController.getAllProperties
);
router.get("/cities", CityController.getAllCities);

router.get("/get-property/:id", PropertyController.getPropertyById);

router.get("/property-locations/:cityId", PropertyController.getLocalitiesByCity);

// router.get("/get-properties", PropertyController.getPropertiesByCityLocality);

router.patch(
  "/update-propertyStatus/:id",
  accessTokenVerify,
  authorizeRoles("admin", "superAdmin"),
  PropertyController.updateApprovalStatus
);
router.patch(
  "/update-property/:id",
  accessTokenVerify,
  authorizeRoles("superAdmin","admin"),
  upload.uploadMultiple("properties", "propertyImages", 5),
  // validateUpdateProperty,
  PropertyController.updateProperty
);

router.delete(
  "/delete-property/:id",
  accessTokenVerify,
  authorizeRoles("superAdmin"),
  PropertyController.deleteProperty
);

module.exports = router;
