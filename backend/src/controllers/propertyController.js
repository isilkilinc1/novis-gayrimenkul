const propertyService = require("../services/propertyService");

// Tüm ilanları getir
const getProperties = async (req, res, next) => {
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
    const property = await propertyService.getPropertyById(id);

    if (!property) {
      return res.status(404).json({
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
    const property = await propertyService.updateProperty(id, req.body);

    if (!property) {
      return res.status(404).json({
        message: "İlan bulunamadı.",
      });
    }

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
};

// YENİ: Sadece ilan durumunu (status) güncelleyen fonksiyon
const updatePropertyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Geçerli durumları tanımlıyoruz
    const allowedStatuses = ["ACTIVE", "INACTIVE", "SOLD", "RENTED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Geçersiz ilan durumu.",
      });
    }

    const property = await propertyService.updatePropertyStatus(id, status);

    if (!property) {
      return res.status(404).json({
        message: "İlan bulunamadı.",
      });
    }

    res.status(200).json({
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
    const property = await propertyService.deleteProperty(id);

    if (!property) {
      return res.status(404).json({
        message: "İlan bulunamadı.",
      });
    }

    res.status(200).json({
      message: "İlan başarıyla silindi.",
      property,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus, // Dışarı aktardık
  deleteProperty,
};
