const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");

const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// =====================================================
// TÜM MÜŞTERİLERİ GETİR
// SADECE ADMIN
// =====================================================

router.get("/", authenticate, requireAdmin, customerController.getCustomers);

// =====================================================
// TEK MÜŞTERİYİ GETİR
// SADECE ADMIN
// =====================================================

router.get("/:id", authenticate, requireAdmin, customerController.getCustomer);

// =====================================================
// YENİ MÜŞTERİ OLUŞTUR
// SADECE ADMIN
// =====================================================

router.post(
  "/",
  authenticate,
  requireAdmin,
  customerController.createNewCustomer,
);

// =====================================================
// MÜŞTERİ GÜNCELLE
// SADECE ADMIN
// =====================================================

router.put(
  "/:id",
  authenticate,
  requireAdmin,
  customerController.updateExistingCustomer,
);

// =====================================================
// MÜŞTERİ SİL
// SADECE ADMIN
// =====================================================

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  customerController.removeCustomer,
);

module.exports = router;
