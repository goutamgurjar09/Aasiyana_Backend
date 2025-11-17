const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// ✅ Cloudinary dynamic storage based on folder
const getStorage = (folderName = "general") =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `uploads/${folderName}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
      public_id: file.originalname.split(".")[0],
    }),
  });

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, JPG, WEBP images allowed"), false);
};

// ✅ Create multer uploader
const uploadSingle = (folderName, fieldName = "image") =>
  multer({
    storage: getStorage(folderName),
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
  }).single(fieldName);

const uploadMultiple = (folderName, fieldName = "images", maxCount = 10) =>
  multer({
    storage: getStorage(folderName),
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
  }).array(fieldName, maxCount);

module.exports = { uploadSingle, uploadMultiple };
