const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/EnquiryController");
const {validateEnquiry} = require("../middleware/useValidations")
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/inquiry", validateEnquiry,enquiryController.createEnquiry);
router.get("/inquiries", accessTokenVerify,authorizeRoles("superAdmin","admin","seller"), enquiryController.getAllEnquiries);
router.delete("/inquiry/:id", accessTokenVerify,authorizeRoles("superAdmin"), enquiryController.deleteEnquiry);

module.exports = router;
