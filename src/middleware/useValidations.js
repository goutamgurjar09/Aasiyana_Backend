const { body, check, validationResult } = require("express-validator");

// Middleware to handle validation errors in proper format

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];

    return res.status(400).json({
      status: "failed",
      message: "Validation error",
      errors: [
        {
          [firstError.path]: firstError.msg,
        },
      ],
    });
  }
  next();
};

// ✅ Signup Validation
const validateSignup = [
  body("fullname")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name should contain only alphabets and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter (A-Z)")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter (a-z)")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number (0-9)")
    .matches(/[@$!%?&]/)
    .withMessage(
      "Password must contain at least one special character (@$!%?&)"
    ),

  body("mobile")
    .notEmpty()
    .withMessage("Mobile is required")
    .isNumeric()
    .withMessage("Mobile must be a numeric")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Must be a valid mobile format."),
  handleValidationErrors,
];

// Validate user login
const validateLogin = [
  check("email")
    .if((value, { req }) => !req.body.mobile)
    .notEmpty()
    .withMessage("Either email or mobile is required")
    .isEmail()
    .withMessage("Must be a valid email format"),

  check("mobile")
    .if((value, { req }) => !req.body.email)
    .notEmpty()
    .withMessage("Either email or mobile is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Must be a valid Indian mobile number"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8–20 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter (a-z)")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number (0-9)")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character"),

  handleValidationErrors,
];

// Validate OTP verification
const validateVerifyOTP = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email format"),
  body("otp_number")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must be a number"),
  handleValidationErrors,
];

// Validate OTP verification
const generateOTP = [
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Must be a valid email format and unique"),
  handleValidationErrors,
];

// Validate password reset
const validateResetPassword = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[@$!%*?&]/)
    .withMessage("Password must contain at least one special character"),

  handleValidationErrors,
];
// Validate Booking
const validateBooking = [
  body("name").notEmpty().withMessage("Name is required"),
  body("mobile")
    .matches(/^[0-9]{10}$/)
    .withMessage("Mobile number must be 10 digits"),
  body("propertyId").notEmpty().withMessage("Property ID is required"),
  body("message").optional().isString(),
  handleValidationErrors,
];

// Validate property
const validateProperty = [
  body("title")
    .notEmpty()
    .withMessage("Title is required.")
    .isString()
    .withMessage("Title must be a string."),

  body("propertyType")
    .notEmpty()
    .withMessage("Property type is required.")
    .isIn(["Apartment", "House", "Villa", "Commercial"])
    .withMessage("Invalid property type."),


  body("facilities")
    .optional({ nullable: true })
    .isString()
    .withMessage("Facilities must be a comma-separated string."),

  body("owner.name")
    .optional({ nullable: true })
    .isString()
    .withMessage("Owner name must be a string."),

  handleValidationErrors,
];

// Validate enquiry
const validateEnquiry = [
  body("fullname").notEmpty().withMessage("Full Name is required."),
  body("email").isEmail().withMessage("Invalid email format."),
  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required.")
    .isNumeric()
    .withMessage("Mobile number must be numeric.")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be exactly 10 digits."),
  body("message")
    .notEmpty()
    .withMessage("Message is required.")
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters long."),
  handleValidationErrors,
];

// Validate update property
const validateUpdateProperty = [
  body("title")
    .notEmpty()
    .withMessage("Title is required.")
    .isString()
    .withMessage("Title must be a string."),

  body("propertyType")
    .notEmpty()
    .withMessage("Property type is required.")
    .isIn(["Apartment", "House", "Villa", "Commercial"])
    .withMessage("Invalid property type."),

  body("location.city")
    .notEmpty()
    .withMessage("City is required.")
    .isString()
    .withMessage("City must be a string."),

  body("facilities")
    .optional({ nullable: true })
    .isString()
    .withMessage("Facilities must be a comma-separated string."),

  body("owner.name")
    .optional({ nullable: true })
    .isString()
    .withMessage("Owner name must be a string."),

  handleValidationErrors,
];

module.exports = {
  validateSignup,
  validateLogin,
  validateProperty,
  validateUpdateProperty,
  validateVerifyOTP,
  generateOTP,
  validateResetPassword,
  validateBooking,
  validateEnquiry,
};
