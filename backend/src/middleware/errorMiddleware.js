const multer = require("multer");

const errorMiddleware = (err, req, res, next) => {
  console.error("Hata Detayı:", err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Dosya boyutu çok büyük. Maksimum 10 MB yükleyebilirsiniz.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Dosya yükleme hatası: ${err.message}`,
    });
  }

  if (err.message && err.message.includes("Yalnızca resim dosyaları")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
  });
};

module.exports = errorMiddleware;
