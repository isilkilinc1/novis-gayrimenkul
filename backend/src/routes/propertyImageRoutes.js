const express = require("express");

const router = express.Router({ mergeParams: true });

const PropertyImageController = require("../controllers/propertyImageController");
const upload = require("../middleware/uploadMiddleware");
const { uploadLimiter } = require("../middleware/rateLimiter");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// =====================================================
// PUBLIC
// FOTOĞRAFLARI GÖRÜNTÜLE
// =====================================================

router.get("/", PropertyImageController.getImages);

// =====================================================
// ADMIN
// FOTOĞRAF YÜKLE (Rate Limit & Multer Protected)
// =====================================================

router.post(
  "/",
  authenticate,
  requireAdmin,
  uploadLimiter,
  upload.array("images", 20),
  PropertyImageController.uploadImages,
);

// =====================================================
// ADMIN
// FOTOĞRAF SİL
// =====================================================

router.delete(
  "/:imageId",
  authenticate,
  requireAdmin,
  PropertyImageController.deleteImage,
);

// =====================================================
// ADMIN
// KAPAK FOTOĞRAFI YAP
// =====================================================

router.patch(
  "/:imageId/cover",
  authenticate,
  requireAdmin,
  PropertyImageController.setCover,
);

// =====================================================
// ADMIN
// FOTOĞRAF SIRALAMASI
// =====================================================

router.patch(
  "/reorder",
  authenticate,
  requireAdmin,
  PropertyImageController.reorderImages,
);

// =====================================================
// ADMIN
// FOTOĞRAF / MEDYA İNDİR
// =====================================================

router.get(
  "/:imageId/download",
  authenticate,
  requireAdmin,
  PropertyImageController.downloadImage,
);

module.exports = router;
