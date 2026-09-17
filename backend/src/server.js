require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`NOVIS API ${PORT} portunda çalışıyor.`);

  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL bağlantısı başarılı.");
  } catch (error) {
    console.error("PostgreSQL bağlantı hatası:", error.message);
  }
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} sinyali alındı. Sunucu güvenli şekilde kapatılıyor...`);

  // 1. Yeni gelen HTTP isteklerini kabul etmeyi durdur
  server.close(async () => {
    console.log("HTTP sunucusu kapatıldı.");

    // 2. PostgreSQL bağlantı havuzunu boşalt ve kapat
    try {
      await pool.end();
      console.log("PostgreSQL bağlantı havuzu güvenle sonlandırıldı.");
      process.exit(0);
    } catch (err) {
      console.error("Veritabanı havuzu kapatılırken hata:", err.message);
      process.exit(1);
    }
  });

  // 3. 10 saniye içinde kapanmazsa süreci zorla sonlandır
  setTimeout(() => {
    console.error("Kapatma zaman aşımına uğradı, süreç zorla sonlandırılıyor.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
