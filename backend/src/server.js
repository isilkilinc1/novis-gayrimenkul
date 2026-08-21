const express = require("express");
const cors = require("cors");
require("dotenv").config();

const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/authRoutes"); // <-- 1. Auth route'unu ekledik
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'ler
app.use(cors());
app.use(express.json());

// Ana test route'u
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NOVIS Gayrimenkul API çalışıyor.",
  });
});

// İlan route'ları
app.use("/api/properties", propertyRoutes);

// Auth (Giriş) route'ları <-- 2. Route'u uygulamaya tanıttık
app.use("/api/auth", authRoutes);

// Hata yakalama middleware'i (En sonda olmalı)
app.use(errorMiddleware);

// Sunucuyu başlatma
app.listen(PORT, () => {
  console.log(`NOVIS API http://localhost:${PORT} adresinde çalışıyor.`);
});
