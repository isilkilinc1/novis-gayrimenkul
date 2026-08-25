const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customerController");

// Tüm müşterileri getir
router.get("/", customerController.getCustomers);

// Tek müşteriyi getir
router.get("/:id", customerController.getCustomer);

// Yeni müşteri oluştur
router.post("/", customerController.createNewCustomer);

// Müşteriyi güncelle
router.put("/:id", customerController.updateExistingCustomer);

// Müşteriyi sil
router.delete("/:id", customerController.removeCustomer);

module.exports = router;
