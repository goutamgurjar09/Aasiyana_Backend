const express = require("express");
const router = express.Router();
const BookingController = require("../controllers/BookingController");
const {
  accessTokenVerify,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const { validateBooking } = require("../middleware/useValidations");

router.post(
  "/create-booking",
  accessTokenVerify,
  validateBooking,
  BookingController.createBooking
);
router.get(
  "/get-bookings",
  accessTokenVerify,
  authorizeRoles("superAdmin", "admin", "seller"),
  BookingController.getAllBookings
);


router.delete(
  "/delete-booking/:id",
  accessTokenVerify,
  authorizeRoles("superAdmin"),
  BookingController.deleteBooking
);
router.patch(
  "/update-status",
  accessTokenVerify,
  authorizeRoles("superAdmin", "admin"),
  BookingController.updateBookingStatus
);
router.get(
  "/total-revenue",
  accessTokenVerify,
  authorizeRoles("superAdmin"),
  BookingController.getTotalRevenue
);
router.get(
  "/total-booking-status-count",
  accessTokenVerify,
  authorizeRoles("superAdmin", "admin", "seller"),
  BookingController.getBookingStatusCounts
);

module.exports = router;
