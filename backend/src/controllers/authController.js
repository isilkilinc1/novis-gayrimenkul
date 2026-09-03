const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      message: "Giriş başarılı.",
      ...result,
    });
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Email veya şifre hatalı.",
      });
    }

    if (error.message === "UNAUTHORIZED_ROLE") {
      return res.status(403).json({
        message: "Bu kullanıcı admin yetkisine sahip değil.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Sunucu hatası.",
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;

    // JWT'den gelen kullanıcı ID'si
    const userId = req.user.userId;

    if (!currentPassword) {
      return res.status(400).json({
        message: "Mevcut şifrenizi girmelisiniz.",
      });
    }

    if (!newEmail && !newPassword) {
      return res.status(400).json({
        message: "Güncellenecek bir bilgi girmelisiniz.",
      });
    }

    if (newPassword && newPassword.length < 8) {
      return res.status(400).json({
        message: "Yeni şifre en az 8 karakter olmalıdır.",
      });
    }

    const result = await authService.updateAdminAccount({
      userId,
      currentPassword,
      newEmail,
      newPassword,
    });

    res.status(200).json({
      message: "Hesap bilgileriniz başarıyla güncellendi.",
      ...result,
    });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı.",
      });
    }

    if (error.message === "UNAUTHORIZED_ROLE") {
      return res.status(403).json({
        message: "Bu işlem için admin yetkisi gereklidir.",
      });
    }

    if (error.message === "CURRENT_PASSWORD_INVALID") {
      return res.status(401).json({
        message: "Mevcut şifreniz hatalı.",
      });
    }

    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Bu e-posta adresi zaten kullanılıyor.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Sunucu hatası.",
    });
  }
};

module.exports = {
  login,
  updateAccount,
};
