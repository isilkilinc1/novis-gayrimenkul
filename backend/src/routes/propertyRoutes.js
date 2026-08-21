const express = require("express");
const propertyController = require("../controllers/propertyController");

const router = express.Router();

// Tüm ilanları getiren adres: GET /api/properties
router.get("/", propertyController.getProperties);

// Tek bir ilanı ID'ye göre getiren adres: GET /api/properties/:id
router.get("/:id", propertyController.getPropertyById);

module.exports = router;
