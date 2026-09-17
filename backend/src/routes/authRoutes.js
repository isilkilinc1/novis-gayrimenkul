const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const validateLogin = require("../middleware/validateLogin");
const { loginLimiter } = require("../middleware/rateLimiter");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// POST /api/auth/login (Brute-force korumalı rate limit)
router.post("/login", loginLimiter, validateLogin, authController.login);

// PUT /api/auth/account
router.put(
  "/account",
  authenticate,
  requireAdmin,
  authController.updateAccount,
);

module.exports = router;
