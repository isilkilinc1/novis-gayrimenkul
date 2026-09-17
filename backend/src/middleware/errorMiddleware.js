const multer = require("multer");

const isProduction = process.env.NODE_ENV === "production";

const errorMiddleware = (err, req, res, next) => {
  // Operational error logging without dumping secrets
  if (isProduction) {
    console.error("[ERROR]", err.name || "Error", ":", err.message || "Internal server error");
  } else {
    console.error("[DEV ERROR DETAIL]:", err);
  }

  // Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Dosya boyutu izin verilen limiti aşıyor. Lütfen daha küçük bir dosya seçin.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Tek seferde yüklenebilecek maksimum dosya sayısı aşıldı.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Beklenmeyen dosya alanı gönderildi.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Dosya yükleme hatası oluştu.",
    });
  }

  // Custom validation & client errors
  if (
    err.message &&
    (err.message.includes("Yalnızca") ||
      err.message.includes("zorunlu") ||
      err.message.includes("Geçersiz") ||
      err.message.includes("bulunamadı"))
  ) {
    const status = err.statusCode || err.status || 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || err.status || 500;

  // In production, mask internal 500 server errors
  let safeMessage = err.message || "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
  if (isProduction && statusCode >= 500) {
    safeMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
  });
};

module.exports = errorMiddleware;
