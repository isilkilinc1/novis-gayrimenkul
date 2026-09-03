const express = require("express");

const siteSettingsController = require("../controllers/siteSettingsController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public
router.get("/", siteSettingsController.getSettings);

// Admin
router.put(
  "/",
  authenticate,
  requireAdmin,
  siteSettingsController.updateSettings,
);

module.exports = router;
