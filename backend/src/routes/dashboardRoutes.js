const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// =====================================================
// ADMIN DASHBOARD İSTATİSTİKLERİ
// =====================================================

router.get(
  "/stats",
  authenticate,
  requireAdmin,
  dashboardController.getDashboardStats,
);

module.exports = router;
