require("dotenv").config();
const CityModel = require("../src/models/City");
const db = require("../src/config/db");

const MUST_HAVE_CITIES = [
  { name: "Indore", latitude: "22.7196", longitude: "75.8577" },
  { name: "Bhopal", latitude: "23.2599", longitude: "77.4126" },
  { name: "Ujjain", latitude: "23.1765", longitude: "75.7885" },
  { name: "Satna", latitude: "24.5820", longitude: "80.8310" },
  { name: "Dewas", latitude: "22.9676", longitude: "76.0534" },
  { name: "Ratlam", latitude: "23.3342", longitude: "75.0374" },
  { name: "Chhindwara", latitude: "22.0574", longitude: "78.9382" },
  { name: "Vidisha", latitude: "23.5260", longitude: "77.8104" },
  { name: "Sehore", latitude: "23.2038", longitude: "77.0844" },
  { name: "Chhatarpur", latitude: "24.9150", longitude: "79.5877" },
  { name: "Pithampur", latitude: "22.6053", longitude: "75.6961" },
];

async function seedMPCities() {
  try {
    await db();
    console.log("✅ MongoDB Connected");

    await CityModel.deleteMany({});
    console.log("🗑 Old data removed");

    await CityModel.insertMany(MUST_HAVE_CITIES);
    console.log(`🌱 ${MUST_HAVE_CITIES.length} MP cities inserted successfully ✅`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedMPCities();
