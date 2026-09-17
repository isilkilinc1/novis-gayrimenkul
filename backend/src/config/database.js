const { Pool } = require("pg");
require("dotenv").config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL ortam değişkeni bulunamadı!");
}

const isProduction = process.env.NODE_ENV === "production";
const isCloudDb = Boolean(
  dbUrl &&
    (dbUrl.includes("neon.tech") ||
      dbUrl.includes("supabase.co") ||
      dbUrl.includes("render.com") ||
      dbUrl.includes("sslmode=require") ||
      dbUrl.includes("sslmode=verify-full")),
);

const useSsl = isProduction || isCloudDb;

const getSslConfig = () => {
  if (!useSsl) return false;

  const sslConfig = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
  };

  if (process.env.DB_CA_CERT) {
    sslConfig.ca = process.env.DB_CA_CERT;
    sslConfig.rejectUnauthorized = true;
  }

  return sslConfig;
};

const pool = new Pool({
  connectionString: dbUrl,
  ssl: getSslConfig(),
  max: process.env.DB_POOL_MAX
    ? parseInt(process.env.DB_POOL_MAX, 10)
    : isProduction
      ? 20
      : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Boşta kalan bağlantılarda beklenmeyen soket kopmaları için hata dinleyici
pool.on("error", (err) => {
  console.error("❌ PostgreSQL boşta bağlantı uyarısı:", err.message);
});

module.exports = pool;
