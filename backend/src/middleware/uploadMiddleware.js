const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Depolama ayarları (Hangi ilanın klasörüne kaydedilecek?)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const propertyId = req.params.propertyId || "temp";
    const uploadDir = path.join(
      __dirname,
      `../../uploads/properties/${propertyId}`,
    );

    // Klasör yoksa otomatik oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Benzersiz isim oluştur: timestamp + orijinal isim (türkçe karakter temizliği ile)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

// Sadece resim dosyalarına izin verelim (Güvenlik kontrolü)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Yalnızca resim dosyaları (jpg, jpeg, png, webp) yüklenebilir!",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Maksimum 10 MB
  fileFilter: fileFilter,
});

module.exports = upload;
