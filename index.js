const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const connectdb = require("./src/config/db");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorHandler = require("./src/middleware/errorHandler");

// Import Routes
const userRoutes = require("./src/routes/UserRoutes");
const propertyRoutes = require("./src/routes/PropertyRoutes");
const enquiryRoutes = require("./src/routes/EnquiryRoutes");
const bookingRoutes = require("./src/routes/BookingRoutes");
const customerRoutes = require("./src/routes/CustomerRoutes");  

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
   origin: [
    "http://localhost:5173",            
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to Database
connectdb();


// Default Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.use("/api/auth", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/inquiries", enquiryRoutes);
app.use("/api/customers", customerRoutes); 

//global Error Handling Middleware
app.use(errorHandler);


// ✅ Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});