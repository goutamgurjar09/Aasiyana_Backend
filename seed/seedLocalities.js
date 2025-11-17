require("dotenv").config();
const db = require("../src/config/db"); 
const City = require("../src/models/City");
const Location = require("../src/models/Location");

const LOCALITIES_DATA = {
  Indore: [
    { name: "Vijay Nagar", lat: 22.7486, lng: 75.8935 },
    { name: "Bhawar Kuan", lat: 22.6940, lng: 75.8639 },
    { name: "Rajwada", lat: 22.7173, lng: 75.8550 },
    { name: "Palasia", lat: 22.7244, lng: 75.8839 },
    { name: "Super Corridor", lat: 22.7645, lng: 75.8470 },
    { name: "MR 10", lat: 22.7619, lng: 75.9089 },
    { name: "Sarafa", lat: 22.7208, lng: 75.8506 },
    { name: "Rau", lat: 22.5155, lng: 75.7611 },
    { name: "Nipania", lat: 22.7517, lng: 75.9151 },
    { name: "LIG Colony", lat: 22.7096, lng: 75.8787 }
  ],
  Bhopal: [
    { name: "New Market", lat: 23.2337, lng: 77.4126 },
    { name: "MP Nagar", lat: 23.2405, lng: 77.4344 },
    { name: "Kolar Road", lat: 23.1901, lng: 77.4091 },
    { name: "Shahpura", lat: 23.2065, lng: 77.4253 },
    { name: "Arera Colony", lat: 23.2140, lng: 77.4309 },
    { name: "BHEL", lat: 23.2289, lng: 77.5156 },
    { name: "Lal Ghati", lat: 23.2566, lng: 77.3988 },
    { name: "Ashoka Garden", lat: 23.2574, lng: 77.4348 },
    { name: "Ayodhya Bypass", lat: 23.2660, lng: 77.4489 },
    { name: "Hoshangabad Road", lat: 23.1875, lng: 77.4642 }
  ],
  Ujjain: [
    { name: "Freeganj", lat: 23.1769, lng: 75.7865 },
    { name: "Nanakhheda", lat: 23.1896, lng: 75.8129 },
    { name: "Mahakaleshwar Temple Area", lat: 23.1740, lng: 75.7681 },
    { name: "Dewas Road", lat: 23.1933, lng: 75.8440 },
    { name: "Pawapuri", lat: 23.1752, lng: 75.7711 },
    { name: "Madhav Nagar", lat: 23.1647, lng: 75.7864 },
    { name: "Neelganga", lat: 23.1950, lng: 75.8099 },
    { name: "Vijay Nagar Ujjain", lat: 23.1817, lng: 75.7934 },
    { name: "Vasant Vihar", lat: 23.1698, lng: 75.7999 },
    { name: "Indira Nagar", lat: 23.1748, lng: 75.8025 }
  ],
  Satna: [
    { name: "Mukhtiyarganj", lat: 24.5829, lng: 80.8319 },
    { name: "Civil Lines", lat: 24.5864, lng: 80.8369 },
    { name: "Rewa Road", lat: 24.5970, lng: 80.8581 },
    { name: "Maihar Road", lat: 24.5845, lng: 80.8277 },
    { name: "Nagod Road", lat: 24.5854, lng: 80.7944 },
    { name: "Chitrakoot Road", lat: 24.5779, lng: 80.8732 },
    { name: "Sherganj", lat: 24.5804, lng: 80.8310 },
    { name: "Panna Naka", lat: 24.5942, lng: 80.8307 },
    { name: "Housing Board Colony", lat: 24.5930, lng: 80.8460 },
    { name: "Venkat Nagar", lat: 24.5813, lng: 80.8407 }
  ],
  Dewas: [
    { name: "MG Road", lat: 22.9673, lng: 76.0567 },
    { name: "Agar Road", lat: 22.9721, lng: 76.0652 },
    { name: "Uday Nagar", lat: 22.9581, lng: 76.0686 },
    { name: "Itawa", lat: 22.9473, lng: 76.0254 },
    { name: "Shiv City", lat: 22.9658, lng: 76.0410 },
    { name: "Industrial Area", lat: 22.9489, lng: 76.0650 },
    { name: "Gomti Nagar", lat: 22.9610, lng: 76.0495 },
    { name: "City Center", lat: 22.9699, lng: 76.0487 },
    { name: "Kotwali Road", lat: 22.9682, lng: 76.0511 },
    { name: "Kalani Bagh", lat: 22.9731, lng: 76.0581 }
  ],
  Sagar: [
    { name: "Civil Lines", lat: 23.8373, lng: 78.7389 },
    { name: "Makronia", lat: 23.8141, lng: 78.7759 },
    { name: "Cantonment", lat: 23.8356, lng: 78.7276 },
    { name: "Khurai Road", lat: 23.8453, lng: 78.7606 },
    { name: "Tilak Ganj", lat: 23.8333, lng: 78.7437 },
    { name: "Katra", lat: 23.8389, lng: 78.7483 },
    { name: "Moti Nagar", lat: 23.8281, lng: 78.7543 },
    { name: "Sunder Nagar", lat: 23.8232, lng: 78.7423 },
    { name: "Gopal Ganj", lat: 23.8422, lng: 78.7296 },
    { name: "Indira Nagar", lat: 23.8174, lng: 78.7661 }
  ],
  Ratlam: [
    { name: "Do Batti", lat: 23.3316, lng: 75.0380 },
    { name: "Kothri Road", lat: 23.3413, lng: 75.0444 },
    { name: "Shastri Nagar", lat: 23.3374, lng: 75.0447 },
    { name: "Manak Chowk", lat: 23.3335, lng: 75.0372 },
    { name: "Sailana Road", lat: 23.3489, lng: 75.0244 },
    { name: "Rajendra Nagar", lat: 23.3354, lng: 75.0533 },
    { name: "Housing Board Colony", lat: 23.3305, lng: 75.0548 },
    { name: "Javra Road", lat: 23.3340, lng: 75.0480 },
    { name: "Kali Talai", lat: 23.3441, lng: 75.0410 },
    { name: "Triveni", lat: 23.3292, lng: 75.0621 }
  ],
  Vidisha: [
    { name: "Lal Ganj", lat: 23.5248, lng: 77.8088 },
    { name: "Tilak Chowk", lat: 23.5276, lng: 77.8120 },
    { name: "Civil Lines", lat: 23.5302, lng: 77.8075 },
    { name: "Ganj Basoda Road", lat: 23.5214, lng: 77.8232 },
    { name: "Supa", lat: 23.5183, lng: 77.8352 },
    { name: "Jawahar Ward", lat: 23.5267, lng: 77.8139 },
    { name: "Rajendra Ward", lat: 23.5271, lng: 77.8192 },
    { name: "Kukrail Road", lat: 23.5299, lng: 77.8274 },
    { name: "Pathari Road", lat: 23.5274, lng: 77.8330 },
    { name: "Khejra", lat: 23.5201, lng: 77.8026 }
  ],
  Sehore: [
    { name: "Bhopal Naka", lat: 23.2068, lng: 77.0867 },
    { name: "Civil Lines", lat: 23.2011, lng: 77.0863 },
    { name: "Kotra", lat: 23.2263, lng: 77.0764 },
    { name: "Berasia Road", lat: 23.1968, lng: 77.1043 },
    { name: "Galla Mandi", lat: 23.2008, lng: 77.0830 },
    { name: "Mandi Area", lat: 23.2019, lng: 77.0810 },
    { name: "Shiv Nagar", lat: 23.2100, lng: 77.0834 },
    { name: "Indra Colony", lat: 23.1983, lng: 77.0905 },
    { name: "Haat Bazaar", lat: 23.2001, lng: 77.0877 },
    { name: "Jawahar Nagar", lat: 23.2030, lng: 77.0918 }
  ]
};

async function seedLocalities() {
  try {
    await db();
    console.log("✅ MongoDB Connected");

    await Location.deleteMany({});
    console.log("🧹 Old localities deleted");

    for (const cityName of Object.keys(LOCALITIES_DATA)) {
      const city = await City.findOne({ name: cityName });
      if (!city) {
        console.warn(`⚠ City not found: ${cityName}`);
        continue;
      }

      const localities = LOCALITIES_DATA[cityName].map((item) => ({
        name: item.name,
        cityId: city._id,
        latitude: item.lat.toFixed(6),
        longitude: item.lng.toFixed(6),
      }));

      await Location.insertMany(localities);
      console.log(`✅ ${cityName} localities seeded (${localities.length})`);
    }

    console.log("🎉 All locations seeded successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Error seeding locations:", error);
    process.exit(1);
  }
}

seedLocalities();
