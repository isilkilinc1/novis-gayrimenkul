const propertyService = require("../services/propertyService");

// Tüm ilanları getiren controller fonksiyonu
const getProperties = async (req, res, next) => {
  try {
    const properties = await propertyService.getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    next(error);
  }
};

// ID'ye göre tek bir ilanı getiren controller fonksiyonu
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

module.exports = {
  getProperties,
  getPropertyById,
};
