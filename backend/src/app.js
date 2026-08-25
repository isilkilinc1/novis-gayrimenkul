const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/database");

// =====================================================
// ROUTES
// =====================================================

const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/authRoutes");
const propertyImageRoutes = require("./routes/propertyImageRoutes");
const customerRoutes = require("./routes/customerRoutes");
const contactRequestRoutes = require("./routes/contactRequestRoutes");

// =====================================================
// ERROR MIDDLEWARE
// =====================================================

const errorMiddleware = require("./middleware/errorMiddleware");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// STATIC FILES
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NOVIS API çalışıyor.",
  });
});

// =====================================================
// DATABASE TEST
// =====================================================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

    res.json({
      success: true,
      database: "PostgreSQL",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database test hatası:", error);

    res.status(500).json({
      success: false,
      message: "Database bağlantısı başarısız.",
    });
  }
});

// =====================================================
// TABLES TEST
// =====================================================

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
    console.error("Tablo test hatası:", error);

    res.status(500).json({
      success: false,
      message: "Tablolar alınamadı.",
    });
  }
});

// =====================================================
// PROPERTY ROUTES
// =====================================================

app.use("/api/properties", propertyRoutes);

// =====================================================
// PROPERTY IMAGE ROUTES
// =====================================================

app.use("/api/properties/:propertyId/images", propertyImageRoutes);

// =====================================================
// AUTH ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

// =====================================================
// CUSTOMER ROUTES
// =====================================================

app.use("/api/customers", customerRoutes);

// =====================================================
// CONTACT REQUEST ROUTES
// =====================================================

app.use("/api/contact-requests", contactRequestRoutes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorMiddleware);

// =====================================================
// EXPORT
// =====================================================

module.exports = app;
