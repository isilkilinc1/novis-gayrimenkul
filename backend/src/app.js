const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/database");

// Rotalarımızı import ediyoruz
const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/authRoutes");
const propertyImageRoutes = require("./routes/propertyImageRoutes"); // <-- Fotoğraf rotalarını ekledik
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// 📁 Yüklenen dosyaları dışarıya açmak için (Static Folder)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 1. Basit Sağlık Kontrolü (Health Check)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NOVIS API çalışıyor.",
  });
});

// 2. Veritabanı Bağlantı Testi
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      success: true,
      database: "PostgreSQL",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Database bağlantısı başarısız.",
    });
  }
});

// 3. Oluşturduğumuz Tabloları Listeleme Testi
app.get("/api/test-tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    res.json({
      success: true,
      tables: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Tablolar alınamadı.",
    });
  }
});

// 4. İlan Rotaları (Property Routes)
app.use("/api/properties", propertyRoutes);

// 5. İlan Fotoğraf Rotaları (Property Image Routes)
app.use("/api/properties/:propertyId/images", propertyImageRoutes);

// 6. Auth Rotaları
app.use("/api/auth", authRoutes);

// 7. Hata Yakalama Middleware'i (En sonda olmalı)
app.use(errorMiddleware);

module.exports = app;
