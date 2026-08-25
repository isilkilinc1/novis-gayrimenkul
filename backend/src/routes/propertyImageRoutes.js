const express = require("express");
const router = express.Router({ mergeParams: true }); // :propertyId parametresini yakalayabilmek için mergeParams: true kritik!
const PropertyImageController = require("../controllers/propertyImageController");
const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware"); // Eğer daha önce projede admin yetki kontrolü için auth middleware kullandıysan

// 1. İlana ait fotoğrafları listele (Herkes görebilir - Public)
router.get("/", PropertyImageController.getImages);

// 2. İlana çoklu fotoğraf yükle (Sadece Admin / Token gerekli)
// upload.array("images", 10) -> Maksimum 10 fotoğraf aynı anda yüklenebilir
router.post(
  "/",
  upload.array("images", 10),
  PropertyImageController.uploadImages,
);

// 3. Fotoğrafı sil
router.delete("/:imageId", PropertyImageController.deleteImage);

// 4. Kapak fotoğrafı yap
router.patch("/:imageId/cover", PropertyImageController.setCover);

// 5. Fotoğraf sıralamasını güncelle
router.patch("/reorder", PropertyImageController.reorderImages);

module.exports = router;
