const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Token hiç gönderilmemişse
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Yetkilendirme token'ı bulunamadı.",
      });
    }

    // 2. "Bearer <token>" formatında mı diye kontrol et
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Geçersiz authorization formatı.",
      });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "novis_dev_secret" : null);

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Sunucu kimlik doğrulama yapılandırması eksik.",
      });
    }

    // 3. Token geçerli mi ve süresi dolmuş mu diye doğrula (HS256 algoritması ile)
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    // Kullanıcı bilgilerini request içine ekle
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Geçersiz veya süresi dolmuş token.",
    });
  }
};

module.exports = {
  authenticate,
};
