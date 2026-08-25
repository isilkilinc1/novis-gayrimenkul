const express = require("express");
const cors = require("cors");
const path = require("path"); // 1. Path kütüphanesini ekledik
require("dotenv").config();

const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/authRoutes");
const propertyImageRoutes = require("./routes/propertyImageRoutes"); // 2. Fotoğraf rotasını ekledik
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'ler
app.use(cors());
app.use(express.json());

// 📁 3. Yüklenen dosyaları dışarıya açan statik klasör tanımı (Çok Önemli!)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Ana test route'u
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NOVIS Gayrimenkul API çalışıyor.",
  });
});

// İlan route'ları
app.use("/api/properties", propertyRoutes);

// Auth (Giriş) route'ları
app.use("/api/auth", authRoutes);

// 📌 4. İlan Fotoğraf Rotaları (MergeParams sayesinde :propertyId buraya bağlanır)
app.use("/api/properties/:propertyId/images", propertyImageRoutes);

// Hata yakalama middleware'i (En sonda olmalı)
app.use(errorMiddleware);

// Sunucuyu başlatma
app.listen(PORT, () => {
  console.log(`NOVIS API http://localhost:${PORT} adresinde çalışıyor.`);
});
