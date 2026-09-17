const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter to protect against abuse.
 * 300 requests per 15-minute window per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.",
  },
});

/**
 * Strict login rate limiter to protect against brute-force attacks on admin credentials.
 * 15 requests per 15-minute window per IP.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çok fazla başarısız giriş denemesi yapıldı. Lütfen 15 dakika sonra tekrar deneyin.",
  },
});

/**
 * Contact request rate limiter to prevent spam and form abuse.
 * 15 requests per 15-minute window per IP.
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çok fazla iletişim talebi gönderildi. Lütfen bir süre sonra tekrar deneyin.",
  },
});

/**
 * Upload endpoint rate limiter to prevent media storage abuse.
 * 40 upload requests per 15-minute window per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Medya yükleme limiti aşıldı. Lütfen daha sonra tekrar deneyin.",
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
  contactLimiter,
  uploadLimiter,
};
