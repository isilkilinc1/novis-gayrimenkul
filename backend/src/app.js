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

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.includes(",")
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : process.env.FRONTEND_URL
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
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
