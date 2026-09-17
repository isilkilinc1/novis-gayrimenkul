const propertyService = require("../services/propertyService");

// 1. A) PUBLIC: Sadece aktif ilanları getir (Ziyaretçiler için - Arama, Filtreler ve Pagination ile birlikte)
const getActiveProperties = async (req, res, next) => {
  try {
    const result = await propertyService.getAllActiveProperties(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 1. B) ADMIN: Tüm ilanları getir (Tüm status'ler dahil)
const getAdminProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
};

// ID'ye göre tek ilan getir
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz ilan ID'si.",
      });
    }

    const property = await propertyService.getPropertyById(numericId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "İlan bulunamadı.",
      });
    }

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

// Yeni ilan oluştur (CREATE)
const createProperty = async (req, res, next) => {
  try {
    const property = await propertyService.createProperty(req.body);
    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
};

// İlanı güncelle (UPDATE)
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz ilan ID'si.",
      });
    }

    const property = await propertyService.updateProperty(numericId, req.body);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "İlan bulunamadı.",
      });
    }

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

// Sadece ilan durumunu (status) güncelleyen fonksiyon
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz ilan ID'si.",
      });
    }

    const { status, customerId, finalPrice, notes, transactionDate } = req.body;

    const allowedStatuses = ["ACTIVE", "INACTIVE", "SOLD", "RENTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz ilan durumu.",
      });
    }

    // Satış veya kiralama işleminde müşteri zorunlu
    if (["SOLD", "RENTED"].includes(status) && !customerId) {
      return res.status(400).json({
        success: false,
        message: "Satış veya kiralama işlemi için müşteri seçilmelidir.",
      });
    }

    const property = await propertyService.updatePropertyStatus(
      numericId,
      status,
      customerId,
      finalPrice,
      notes,
      transactionDate,
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "İlan bulunamadı.",
      });
    }

    res.status(200).json({
      success: true,
      message: "İlan durumu başarıyla güncellendi.",
      property,
    });
  } catch (error) {
    next(error);
  }
};

// İlanı sil (DELETE)
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz ilan ID'si.",
      });
    }

    const property = await propertyService.deleteProperty(numericId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "İlan bulunamadı.",
      });
    }

    res.status(200).json({
      success: true,
      message: "İlan başarıyla silindi.",
      property,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveProperties,
  getAdminProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
};
