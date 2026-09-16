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

// =====================================================
// CORS CONFIGURATION
// =====================================================

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (curl, mobile apps, server-to-server)
  if (!origin) return true;

  const normalized = origin.replace(/\/$/, "").toLowerCase();

  // 1. FRONTEND_URL environment variable (tekil veya virgülle ayrılmış liste)
  if (process.env.FRONTEND_URL) {
    const envOrigins = process.env.FRONTEND_URL.split(",")
      .map((u) => u.trim().replace(/\/$/, "").toLowerCase())
      .filter(Boolean);

    if (envOrigins.includes(normalized)) {
      return true;
    }
  }

  // 2. Ana canlı frontend domaini
  if (normalized === "https://novis-gayrimenkul-frontend-2026.vercel.app") {
    return true;
  }

  // 3. Vercel Preview, Git Branch ve genel Vercel deployment domainleri
  if (/^https:\/\/[a-z0-9-_.]+\.vercel\.app$/.test(normalized)) {
    return true;
  }

  // 4. Localhost geliştirme ortamları
  if (
    /^http:\/\/localhost(:\d+)?$/.test(normalized) ||
    /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)
  ) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error(`CORS policy blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  optionsSuccessStatus: 204,
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use(express.json());

// =====================================================
// STATIC FILES
// =====================================================

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// =====================================================
// HEALTH CHECK
// =====================================================

const healthHandler = (req, res) => {
  res.json({
    success: true,
    message: "NOVIS API çalışıyor.",
  });
};

app.get("/", healthHandler);
app.get("/api", healthHandler);
app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

// =====================================================
// API ROUTES
// =====================================================

// Standard /api rotaları
app.use("/api/properties", propertyRoutes);
app.use("/api/properties/:propertyId/images", propertyImageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/contact-requests", contactRequestRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Serverless / Proxy / Direct prefixsiz rota desteği
app.use("/properties", propertyRoutes);
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/transactions", transactionRoutes);
app.use("/contact-requests", contactRequestRoutes);
app.use("/site-settings", siteSettingsRoutes);
app.use("/dashboard", dashboardRoutes);

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorMiddleware);

// =====================================================
// EXPORT
// =====================================================

module.exports = app;
