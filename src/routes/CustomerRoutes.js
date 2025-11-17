const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
} = require("../controllers/CustomerController");
const { accessTokenVerify, authorizeRoles } = require("../middleware/authMiddleware");

// ✅ Routes
router.post("/customers", createCustomer);
router.get("/customers", accessTokenVerify, authorizeRoles("superAdmin"), getAllCustomers);      
router.get("/customers/:id", getCustomerById);    
router.delete("/customers/:id", deleteCustomer); 

module.exports = router;
