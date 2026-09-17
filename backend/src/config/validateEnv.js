/**
 * Production environment variable validator.
 * Ensures critical configuration is set before starting the application.
 */
const validateEnv = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const requiredProductionVars = [
    "DATABASE_URL",
    "JWT_SECRET",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  if (isProduction) {
    const missing = requiredProductionVars.filter(
      (key) => !process.env[key] || process.env[key].trim() === "",
    );

    if (missing.length > 0) {
      console.error(
        "❌ [FATAL] Production ortamı için gerekli ortam değişkenleri eksik:",
        missing.join(", "),
      );
      throw new Error(
        `Production startup aborted: Missing required environment variables (${missing.join(", ")})`,
      );
    }

    // JWT_SECRET strength check: minimum 32 characters (256-bit security baseline for HS256)
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.error(
        "❌ [FATAL] Production ortamında JWT_SECRET en az 32 karakter (256-bit) uzunluğunda ve güvenli olmalıdır.",
      );
      throw new Error(
        "Production startup aborted: JWT_SECRET must be at least 32 characters long.",
      );
    }
  } else {
    // Development warnings
    if (!process.env.DATABASE_URL) {
      console.warn("⚠️ [DEV WARNING] DATABASE_URL tanımlanmamış.");
    }
    if (!process.env.JWT_SECRET) {
      console.warn(
        "⚠️ [DEV WARNING] JWT_SECRET tanımlanmamış. Geliştirme için varsayılan gizli anahtar kullanılacak.",
      );
    }
  }
};

module.exports = validateEnv;
