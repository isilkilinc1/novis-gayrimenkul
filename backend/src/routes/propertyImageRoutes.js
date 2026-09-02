const express = require("express");

const router = express.Router({ mergeParams: true });

const PropertyImageController = require("../controllers/propertyImageController");

const upload = require("../middleware/uploadMiddleware");

const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// =====================================================
// PUBLIC
// FOTOĞRAFLARI GÖRÜNTÜLE
// =====================================================

router.get("/", PropertyImageController.getImages);

// =====================================================
// ADMIN
// FOTOĞRAF YÜKLE
// =====================================================

router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.array("images", 10),
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

module.exports = router;
