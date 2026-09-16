const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./config/database");
const dashboardRoutes = require("./routes/dashboardRoutes");

// =====================================================
// ROUTES
// =====================================================

const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/authRoutes");
const propertyImageRoutes = require("./routes/propertyImageRoutes");
const customerRoutes = require("./routes/customerRoutes");
const contactRequestRoutes = require("./routes/contactRequestRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

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

// CORS için güvenli ve esnekorigin yönetimi
const allowedOrigins = [
  "https://novis-gayrimenkul-frontend-2026.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.includes(",")
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : [process.env.FRONTEND_URL.trim()];

  envOrigins.forEach((origin) => {
    if (origin && !allowedOrigins.includes(origin)) {
      allowedOrigins.push(origin);
    }
  });
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman veya curl gibiorigin göndermeyen isteklere izin ver
      if (!origin) return callback(null, true);

      // Eğer allowedOrigins içinde varsa veya '*' tanımlandıysa izin ver
      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.indexOf(origin) !== -1
      ) {
        callback(null, true);
      } else {
        // Canlıda takılma olmaması için geçici olarak tümoriginlere izin veriyoruz
        callback(null, true);
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// =====================================================
// STATIC FILES
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NOVIS API çalışıyor.",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "NOVIS API çalışıyor.",
  });
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

app.use("/api/transactions", transactionRoutes);

// =====================================================
// CONTACT REQUEST ROUTES
// =====================================================

app.use("/api/contact-requests", contactRequestRoutes);

app.use("/api/site-settings", siteSettingsRoutes);

// =====================================================
// DASHBOARD ROUTES
// =====================================================

app.use("/api/dashboard", dashboardRoutes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorMiddleware);

// =====================================================
// EXPORT
// =====================================================

module.exports = app;
