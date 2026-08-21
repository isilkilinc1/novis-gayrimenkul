require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/database");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor.`);

  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL bağlantısı başarılı.");
  } catch (error) {
    console.error("PostgreSQL bağlantı hatası:", error.message);
  }
});
