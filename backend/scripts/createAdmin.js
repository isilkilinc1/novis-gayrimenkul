const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

const createAdmin = async () => {
  try {
    const email = "admin@novisgayrimenkul.com";
    const password = "NovisSecurePassword123!"; // Güçlü geçici şifremiz

    // Şifreyi bcrypt ile güvenli bir şekilde hash'liyoruz (şifreliyoruz)
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
      `,
      [email, passwordHash, "admin"],
    );

    console.log("Admin başarıyla oluşturuldu:");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("Admin oluşturulurken hata:", error);
  } finally {
    // İşlem bittikten sonra veritabanı bağlantısını kapatıyoruz
    await pool.end();
  }
};

createAdmin();
