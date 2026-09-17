const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");

const isProduction = process.env.NODE_ENV === "production";

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

let storage;

if (isCloudinaryConfigured) {
  storage = new CloudinaryStorage({
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
  });
} else if (!isProduction) {
  // Yalnızca DEVELOPMENT ortamında local disk fallback
  storage = multer.diskStorage({
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
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `media-${uniqueSuffix}${ext}`);
    },
  });
} else {
  // Production'da Cloudinary yoksa local disk fallback YAPILMAZ!
  storage = multer.memoryStorage();
}

// Strict MIME + Extension validation
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];

const ALLOWED_VIDEO_MIMES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];
const ALLOWED_VIDEO_EXTS = ["mp4", "webm", "mov", "avi", "mkv"];

const fileFilter = (req, file, cb) => {
  // In production, reject if Cloudinary is not configured
  if (isProduction && !isCloudinaryConfigured) {
    const err = new Error(
      "Production ortamında medya depolama servisi (Cloudinary) yapılandırılmamış.",
    );
    err.statusCode = 500;
    return cb(err, false);
  }

  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = (file.mimetype || "").toLowerCase();

  const isImageMime = ALLOWED_IMAGE_MIMES.includes(mime);
  const isImageExt = ALLOWED_IMAGE_EXTS.includes(ext);

  const isVideoMime =
    ALLOWED_VIDEO_MIMES.includes(mime) || mime.startsWith("video/");
  const isVideoExt = ALLOWED_VIDEO_EXTS.includes(ext);

  if (isImageMime && isImageExt) {
    return cb(null, true);
  }

  if (isVideoMime && isVideoExt) {
    return cb(null, true);
  }

  const err = new Error(
    "Yalnızca geçerli resim (jpg, jpeg, png, webp) veya video (mp4, webm, mov, avi, mkv) dosyaları yüklenebilir!",
  );
  err.statusCode = 400;
  return cb(err, false);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for videos
    files: 20, // Tek seferde en fazla 20 dosya
  },
  fileFilter,
});

module.exports = upload;
