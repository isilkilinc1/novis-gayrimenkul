const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const validateLogin = require("../middleware/validateLogin");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// POST /api/auth/login
router.post("/login", validateLogin, authController.login);

// PUT /api/auth/account
router.put(
  "/account",
  authenticate,
  requireAdmin,
  authController.updateAccount,
);

module.exports = router;
