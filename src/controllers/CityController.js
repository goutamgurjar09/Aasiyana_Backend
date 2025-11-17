const City = require("../models/City"); 
const { success, error } = require("../utils/responseHandler");

// Fetch all cities
exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.find();
    if (!cities || cities.length === 0) {
      return error(res, new Error("No cities found"), 400);
    }
    success(res,cities, "Cities fetched successfully", 201);
  } catch (err) {
       return error(res, err, 500);
  }
};