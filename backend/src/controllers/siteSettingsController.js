const siteSettingsService = require("../services/siteSettingsService");

const getSettings = async (req, res, next) => {
  try {
    const settings = await siteSettingsService.getSiteSettings();

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { about_title, about_content, phone, email } = req.body;

    if (!about_title || !about_content || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Tüm alanlar doldurulmalıdır.",
      });
    }

    const settings = await siteSettingsService.updateSiteSettings({
      about_title: about_title.trim(),
      about_content: about_content.trim(),
      phone: phone.trim(),
      email: email.trim(),
    });

    res.json({
      success: true,
      message: "Site ayarları başarıyla güncellendi.",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
