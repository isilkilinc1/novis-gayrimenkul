const express = require("express");
const transactionController = require("../controllers/transactionController");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  requireAdmin,
  transactionController.getTransactions,
);
router.get("/export", authenticate, requireAdmin, transactionController.exportTransactions);
router.get("/customer/:customerId", authenticate, requireAdmin, transactionController.getCustomerHistory);
router.patch("/:id", authenticate, requireAdmin, transactionController.updateTransaction);
router.delete("/:id", authenticate, requireAdmin, transactionController.deleteTransaction);

module.exports = router;
