const express = require("express");
const cors = require("cors");
const pool = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());

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

module.exports = app;
