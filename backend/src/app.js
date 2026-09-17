const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const validateEnv = require("./config/validateEnv");
const { apiLimiter } = require("./middleware/rateLimiter");

// Validate environment variables on startup
validateEnv();

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
const dashboardRoutes = require("./routes/dashboardRoutes");

// =====================================================
// ERROR MIDDLEWARE
// =====================================================

const errorMiddleware = require("./middleware/errorMiddleware");

// =====================================================
// APP & HTTP HARDENING
// =====================================================

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// Security Headers (configured to not break Leaflet/Cloudinary/media resources)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);

// =====================================================
// CORS CONFIGURATION
// =====================================================

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (curl, mobile apps, server-to-server, health checks)
  if (!origin) return true;

  const normalized = origin.replace(/\/$/, "").toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  // 1. FRONTEND_URL environment variable (tekil veya virgülle ayrılmış liste)
  if (process.env.FRONTEND_URL) {
    const envOrigins = process.env.FRONTEND_URL.split(",")
      .map((u) => u.trim().replace(/\/$/, "").toLowerCase())
      .filter(Boolean);

    if (envOrigins.includes(normalized)) {
      return true;
    }
  }

  // 2. Development ortamında localhost ve 127.0.0.1 izinleri
  if (!isProduction) {
    if (
      /^http:\/\/localhost(:\d+)?$/.test(normalized) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(normalized)
    ) {
      return true;
    }
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[CORS Blocked] Origin: ${origin}`);
      }
      callback(new Error("CORS policy blocked this origin."));
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

// Request Body Limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Rate Limiting (Public & general API abuse protection)
app.use("/api", apiLimiter);

// Sensitive API response caching prevention
app.use("/api", (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private",
  );
  next();
});

// =====================================================
// STATIC FILES (Dev / Local fallback)
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
app.use("/api/properties/:propertyId/images", propertyImageRoutes);
app.use("/api/properties/images", propertyImageRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/contact-requests", contactRequestRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Serverless / Proxy / Direct prefixsiz rota desteği
app.use("/properties/:propertyId/images", propertyImageRoutes);
app.use("/properties/images", propertyImageRoutes);
app.use("/properties", propertyRoutes);
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/transactions", transactionRoutes);
app.use("/contact-requests", contactRequestRoutes);
app.use("/site-settings", siteSettingsRoutes);
app.use("/dashboard", dashboardRoutes);

// Unmatched API Route JSON 404 Handler
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "İstenen API endpoint'i bulunamadı.",
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorMiddleware);

// =====================================================
// EXPORT
// =====================================================

module.exports = app;
