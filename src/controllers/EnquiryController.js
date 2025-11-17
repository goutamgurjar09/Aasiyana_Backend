const Enquiry = require("../models/Enquiry");
const { success, error } = require("../utils/responseHandler");
const {sendSms} = require("../utils/SendSms");

// ✅ POST - Create a new enquiry
exports.createEnquiry = async (req, res) => {
  try {
    const { fullname, email, mobile, message } = req.body;

    const newEnquiry = await Enquiry.create({
      fullname,
      email,
      mobile,
      message,
    });
    // Send SMS notification to admin
    const adminMobile = process.env.ADMIN_MOBILE;
    const smsMessage = `New Enquiry from ${fullname}. Mobile: ${mobile}. Message: ${message}`;
    await sendSms(adminMobile, smsMessage);
    return success(res, newEnquiry, "Enquiry submitted successfully", 201);

  } catch (err) {
    return error(res, err);
  }
};

// ✅ GET - Fetch all enquiries
exports.getAllEnquiries = async (req, res) => {
  try {
    let { page = 1, limit = 10, search } = req.query;

    let filter = {};

    // 🔍 Search by fullname or email
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { fullname: { $regex: regex } },
        { email: { $regex: regex } },
      ];
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const totalEnquiries = await Enquiry.countDocuments(filter);

    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return success(res, {
      enquiries,
      totalEnquiries,
      currentPage: page,
      totalPages: Math.ceil(totalEnquiries / limit),
      hasNextPage: page * limit < totalEnquiries,
      hasPrevPage: page > 1,
    }, "Enquiries fetched successfully");

  } catch (err) {
    return error(res, err);
  }
};

// ✅ DELETE - Delete an enquiry by ID
exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return error(res, new Error("Enquiry not found"), 404);
    }

    return success(res, null, "Enquiry deleted successfully");

  } catch (err) {
    return error(res, err);
  }
};
