const Customer = require("../models/Customer");
const { success, error } = require("../utils/responseHandler");

// ✅ Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, mobile, propertyId } = req.body;
    const existingCustomer = await Customer.findOne({ mobile: mobile });

    if (existingCustomer) {
      return res.status(200).json({ message: "Customer already exists"});
    }

    const customer = await Customer.create({ name, mobile, propertyId });
    return success(res, customer, "Customer created successfully", 201);
  } catch (err) {
    return error(res, err, 500);
  }
};

// ✅ Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("propertyId");
    return success(res, customers, "Customers fetched successfully");
  } catch (err) {
    return error(res, err, 500);
  }
};

// ✅ Get single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).populate("propertyId");
    if (!customer) return error(res, new Error("Customer not found"), 404);
    return success(res, customer, "Customer fetched successfully");
  } catch (err) {
    return error(res, err, 500);
  }
};

// ✅ Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) return error(res, new Error("Customer not found"), 404);
    return success(res, customer, "Customer deleted successfully");
  } catch (err) {
    return error(res, err, 500);
  }
};
