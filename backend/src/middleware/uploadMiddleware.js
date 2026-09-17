const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = isCloudinaryConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => {
        const isVideo =
          file.mimetype.startsWith("video/") ||
          /\.(mp4|webm|mov|avi|mkv)$/i.test(file.originalname);

        return {
          folder: "novis-gayrimenkul/properties",
          resource_type: isVideo ? "video" : "image",
          allowed_formats: isVideo
            ? ["mp4", "webm", "mov", "avi", "mkv"]
            : ["jpg", "jpeg", "png", "webp"],
        };
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const propertyId = req.params.propertyId || "temp";
        const uploadDir = path.join(
          __dirname,
          `../../uploads/properties/${propertyId}`,
        );

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `media-${uniqueSuffix}${ext}`);
      },
    });

const fileFilter = (req, file, cb) => {
  const allowedImageExt = /jpeg|jpg|png|webp/i;
  const allowedVideoExt = /mp4|webm|mov|avi|mkv/i;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");

  const isImage =
    allowedImageExt.test(ext) || file.mimetype.startsWith("image/");
  const isVideo =
    allowedVideoExt.test(ext) || file.mimetype.startsWith("video/");

  if (isImage || isVideo) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Yalnızca resim (jpg, jpeg, png, webp) veya video (mp4, webm, mov, avi, mkv) dosyaları yüklenebilir!",
    ),
    false,
  );
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for videos
  },
  fileFilter,
});

module.exports = upload;
