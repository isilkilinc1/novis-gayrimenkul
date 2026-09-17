const contactService = require("../services/contactRequestService");

// =====================================================
// TÜM TALEPLERİ GETİR
// =====================================================

const getRequests = async (req, res, next) => {
  try {
    const requests = await contactService.getAllContactRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// =====================================================
// YENİ TALEP OLUŞTUR
// PUBLIC
// =====================================================

const createRequest = async (req, res, next) => {
  try {
    const { name, phone, email, message, property_id } = req.body;

    // Zorunlu alanlar
    if (!name || name.trim() === "" || !message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Ad soyad ve mesaj alanları zorunludur.",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Ad soyad çok uzun.",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Mesaj alanı en fazla 2000 karakter olabilir.",
      });
    }

    const parsedPropertyId =
      property_id !== undefined && property_id !== null && property_id !== ""
        ? parseInt(property_id, 10) || null
        : null;

    const newRequest = await contactService.createContactRequest({
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      email: email ? email.trim() : null,
      message: message.trim(),
      property_id: parsedPropertyId,
    });

    res.status(201).json({
      success: true,
      message: "İletişim talebiniz başarıyla gönderildi.",
      data: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// DURUM GÜNCELLE
// =====================================================

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz talep ID'si.",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "NEW",
      "CONTACTED",
      "DISCUSSED",
      "COMPLETED",
      "ARCHIVED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz durum.",
      });
    }

    const updated = await contactService.updateContactRequestStatus(
      numericId,
      status,
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "İletişim talebi bulunamadı.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Durum başarıyla güncellendi.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// TALEP SİL
// =====================================================

const removeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (!numericId || isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz talep ID'si.",
      });
    }

    const deleted = await contactService.deleteContactRequest(numericId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "İletişim talebi bulunamadı.",
      });
    }

    res.status(200).json({
      success: true,
      message: "İletişim talebi başarıyla silindi.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  createRequest,
  updateStatus,
  removeRequest,
};
