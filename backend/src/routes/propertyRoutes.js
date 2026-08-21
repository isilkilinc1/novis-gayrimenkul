const express = require("express");
const propertyController = require("../controllers/propertyController");

const router = express.Router();

// GET /api/properties -> Tüm ilanları getir
router.get("/", propertyController.getProperties);

// GET /api/properties/:id -> Tek bir ilanı getir
router.get("/:id", propertyController.getPropertyById);

// POST /api/properties -> Yeni ilan oluştur
router.post("/", propertyController.createProperty);

// PUT /api/properties/:id -> İlanı güncelle
router.put("/:id", propertyController.updateProperty);

// DELETE /api/properties/:id -> İlanı sil
router.delete("/:id", propertyController.deleteProperty);

module.exports = router;
