const cloudinary = require("./cloudinary");


const deleteCloudinaryImage = async (imgPath) => {
  try {
    if (!imgPath) return;

    let publicId = imgPath;

    // If it is a full cloudinary URL, extract publicId
    if (imgPath.startsWith("http")) {
      const cleanUrl = imgPath.split("?")[0]; 
      const parts = cleanUrl.split("/");
      
      // Find uploads index
      const uploadsIdx = parts.indexOf("uploads");
      if (uploadsIdx === -1) throw new Error("Invalid Cloudinary image URL");

      // build publicId from URL
      publicId = `uploads/${parts[uploadsIdx + 1]}/${parts.pop().split(".")[0]}`;
    }

    // If only filename given, assume default folder `uploads/properties`
    if (!publicId.includes("/")) {
      publicId = `uploads/properties/${publicId.split(".")[0]}`;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log("✅ Deleted Cloudinary file:", publicId, result);
    return result;
  } catch (err) {
    console.warn("⚠️ Failed to delete Cloudinary file:", imgPath, err.message);
  }
};

module.exports = deleteCloudinaryImage;


