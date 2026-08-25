const contactService = require("../services/contactRequestService");

// =====================================================
// TÜM TALEPLERİ GETİR
// =====================================================

const getRequests = async (req, res) => {
  try {
    const requests = await contactService.getAllContactRequests();

    res.status(200).json(requests);
  } catch (error) {
    console.error("İletişim talepleri getirilemedi:", error);

    res.status(500).json({
      message: "İletişim talepleri getirilemedi.",
    });
  }
};

// =====================================================
// YENİ TALEP OLUŞTUR
// PUBLIC
// =====================================================

const createRequest = async (req, res) => {
  try {
    const { name, phone, email, message, property_id } = req.body;

    // Zorunlu alanlar
    if (!name || !message) {
      return res.status(400).json({
        message: "Ad soyad ve mesaj alanları zorunludur.",
      });
    }

    const newRequest = await contactService.createContactRequest({
      name,
      phone,
      email,
      message,
      property_id,
    });

    res.status(201).json({
      message: "İletişim talebiniz başarıyla gönderildi.",
      data: newRequest,
    });
  } catch (error) {
    console.error("İletişim talebi oluşturulamadı:", error);

    res.status(500).json({
      message: "Talep gönderilirken hata oluştu.",
    });
  }
};

// =====================================================
// DURUM GÜNCELLE
// =====================================================

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
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
        message: "Geçersiz durum.",
      });
    }

    const updated = await contactService.updateContactRequestStatus(id, status);

    if (!updated) {
      return res.status(404).json({
        message: "İletişim talebi bulunamadı.",
      });
    }

    res.status(200).json({
      message: "Durum başarıyla güncellendi.",
      data: updated,
    });
  } catch (error) {
    console.error("İletişim talebi durumu güncellenemedi:", error);

    res.status(500).json({
      message: "Durum güncellenirken hata oluştu.",
    });
  }
};

// =====================================================
// TALEP SİL
// =====================================================

const removeRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await contactService.deleteContactRequest(id);

    if (!deleted) {
      return res.status(404).json({
        message: "İletişim talebi bulunamadı.",
      });
    }

    res.status(200).json({
      message: "İletişim talebi başarıyla silindi.",
    });
  } catch (error) {
    console.error("İletişim talebi silinemedi:", error);

    res.status(500).json({
      message: "Silme sırasında hata oluştu.",
    });
  }
};

module.exports = {
  getRequests,
  createRequest,
  updateStatus,
  removeRequest,
};
