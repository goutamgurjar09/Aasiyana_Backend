const Booking = require("../models/Booking");
const { success, error } = require("../utils/responseHandler");
const sendEmail = require("../utils/sendEmail");

// ✅ Create Booking
exports.createBooking = async (req, res) => {
  try {
    const { name, mobile, propertyId, userId, message } = req.body;

    const newBooking = new Booking({
      name,
      mobile,
      propertyId,
      userId,
      message,
    });

    await newBooking.save();

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Property Booking 🏡",
      type: "booking",
      data: { name, mobile, propertyId, message },
    });

    return success(res, newBooking, "Property booked successfully");
  } catch (err) {
    return error(res, err, 500);
  }
};

// ✅ Get All Bookings
exports.getAllBookings = async (req, res) => {
  try {
    let { page = 1, limit = 10, status, name } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (name) filter.name = new RegExp(name, "i");

    page = parseInt(page);
    limit = parseInt(limit);

    const totalBookings = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate("propertyId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return success(res, {
      bookings,
      totalBookings,
      currentPage: page,
      totalPages: Math.ceil(totalBookings / limit),
      hasNextPage: page * limit < totalBookings,
      hasPrevPage: page > 1,
    }, "Bookings fetched successfully");

  } catch (err) {
    return error(res, err);
  }
};

// ✅ Get total booking counts by status in one API
exports.getBookingStatusCounts = async (req, res) => {
  try {
    const result = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert aggregation result to object
    const counts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0
    };

    result.forEach(item => {
      counts[item._id] = item.count;
    });

    return success(
      res,
      counts,
      "Booking status counts fetched",
    );
  } catch (err) {
    return error(res, err);
  }
};


// ✅ Update Booking Status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) return error(res, new Error("Booking not found"), 404);

    return success(res, updatedBooking, "Booking status updated successfully");

  } catch (err) {
    return error(res, err);
  }
};

// ✅ Delete Booking
exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) return error(res, new Error("Booking not found"), 404);

    return success(res, deletedBooking, "Booking deleted successfully");

  } catch (err) {
    return error(res, err);
  }
};

// ✅ Revenue Calculation
exports.getTotalRevenue = async (req, res) => {
  try {
    const revenueData = await Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $lookup: {
          from: "properties",
          localField: "propertyId",
          foreignField: "_id",
          as: "property",
        },
      },
      { $unwind: "$property" },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: { $sum: "$property.price" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return success(res, revenueData, "Revenue fetched successfully");

  } catch (err) {
    return error(res, err);
  }
};
