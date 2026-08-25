const express = require("express");

const contactController = require("../controllers/contactRequestController");

const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC
// Ziyaretçi iletişim formu gönderir
// POST /api/contact-requests
// =====================================================

router.post("/", contactController.createRequest);

// =====================================================
// ADMIN
// Tüm iletişim taleplerini getirir
// GET /api/contact-requests
// =====================================================

router.get("/", authenticate, requireAdmin, contactController.getRequests);

// =====================================================
// ADMIN
// Durum güncelle
// PATCH /api/contact-requests/:id/status
// =====================================================

router.patch(
  "/:id/status",
  authenticate,
  requireAdmin,
  contactController.updateStatus,
);

// =====================================================
// ADMIN
// Talep sil
// DELETE /api/contact-requests/:id
// =====================================================

router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  contactController.removeRequest,
);

module.exports = router;
