const express = require("express");
const propertyController = require("../controllers/propertyController");

// Güvenlik middleware'lerimizi import ediyoruz
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// --- PUBLIC (HERKESİN ERİŞEBİLDİĞİ) ROTALAR ---
// GET /api/properties -> Sadece ACTIVE (aktif) olan ilanları getir
router.get("/", propertyController.getActiveProperties);

// GET /api/properties/:id -> Tek bir ilanı getir
router.get("/:id", propertyController.getPropertyById);

// --- PROTECTED (SADECE ADMİNİN ERİŞEBİLDİĞİ) ROTALAR ---
// GET /api/properties/admin/all -> Tüm ilanları (aktif, satılmış vb.) getir
router.get(
  "/admin/all",
  authenticate,
  requireAdmin,
  propertyController.getAdminProperties,
);

// POST /api/properties -> Yeni ilan oluştur
router.post("/", authenticate, requireAdmin, propertyController.createProperty);

// PUT /api/properties/:id -> İlanı güncelle
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  propertyController.updateProperty,
);

// PATCH /api/properties/:id/status -> Sadece ilan durumunu güncelle
router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  propertyController.updatePropertyStatus,
);

// DELETE /api/properties/:id -> İlanı sil
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  propertyController.deleteProperty,
);

module.exports = router;
