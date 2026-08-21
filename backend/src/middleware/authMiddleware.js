const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Token hiç gönderilmemişse
    if (!authHeader) {
      return res.status(401).json({
        message: "Yetkilendirme token'ı bulunamadı.",
      });
    }

    // 2. "Bearer <token>" formatında mı diye kontrol et
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Geçersiz authorization formatı.",
      });
    }

    const token = parts[1];

    // 3. Token geçerli mi ve süresi dolmuş mu diye doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcı bilgilerini request içine ekle ki sonraki adımda bilelim
    req.user = decoded;

    next(); // Her şey yolundaysa bir sonraki adıma geç
  } catch (error) {
    return res.status(401).json({
      message: "Geçersiz veya süresi dolmuş token.",
    });
  }
};

module.exports = {
  authenticate,
};
