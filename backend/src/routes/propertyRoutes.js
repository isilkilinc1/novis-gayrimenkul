const express = require("express");
const propertyController = require("../controllers/propertyController");

// Güvenlik middleware'lerimizi import ediyoruz
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// --- PUBLIC (HERKESİN ERİŞEBİLDİĞİ) ROTALAR ---
// GET /api/properties -> Sadece ACTIVE (aktif) olan ilanları getir
router.get("/", propertyController.getActiveProperties);

// --- ADMIN ---
router.get(
  "/admin/all",
  authenticate,
  requireAdmin,
  propertyController.getAdminProperties,
);

router.post("/", authenticate, requireAdmin, propertyController.createProperty);

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  propertyController.updateProperty,
);

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  propertyController.updatePropertyStatus,
);

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  propertyController.deleteProperty,
);

// ID'ye göre ilan
router.get("/:id", propertyController.getPropertyById);

module.exports = router;
