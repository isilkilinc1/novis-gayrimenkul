const requireAdmin = (req, res, next) => {
  // 1. Önce authMiddleware çalışmış ve req.user doldurulmuş olmalı
  if (!req.user) {
    return res.status(401).json({
      message: "Kimlik doğrulama gerekli.",
    });
  }

  // 2. Kullanıcının rolü admin değilse içeri alma
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Bu işlem için admin yetkisi gereklidir.",
    });
  }

  // Her şey yolundaysa devam et
  next();
};

module.exports = {
  requireAdmin,
};
