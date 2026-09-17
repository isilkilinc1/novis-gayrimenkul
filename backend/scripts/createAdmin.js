const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

const createAdmin = async () => {
  const email = (
    process.env.INITIAL_ADMIN_EMAIL || "admin@novisgayrimenkul.com"
  )
    .trim()
    .toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!password || password.trim().length === 0) {
    console.error(
      "❌ Hata: INITIAL_ADMIN_PASSWORD ortam değişkeni tanımlanmamış.",
    );
    console.error(
      "Güvenlik gereği admin hesabı oluşturulamadı. Lütfen .env dosyanızda veya deployment ayarlarınızda INITIAL_ADMIN_PASSWORD değişkenini tanımlayın.",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error(
      "❌ Hata: INITIAL_ADMIN_PASSWORD değeri en az 8 karakter uzunluğunda olmalıdır.",
    );
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await pool.query(
      "SELECT id, email, role FROM users WHERE email = $1",
      [email],
    );

    let user;
    if (existingUser.rows.length > 0) {
      const updateResult = await pool.query(
        `
        UPDATE users
        SET password_hash = $1, role = 'admin', updated_at = CURRENT_TIMESTAMP
        WHERE email = $2
        RETURNING id, email, role, updated_at
        `,
        [passwordHash, email],
      );
      user = updateResult.rows[0];
      console.log("✅ Mevcut admin kullanıcısı başarıyla güncellendi:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } else {
      const insertResult = await pool.query(
        `
        INSERT INTO users (
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, 'admin')
        RETURNING id, email, role, created_at
        `,
        [email, passwordHash],
      );
      user = insertResult.rows[0];
      console.log("✅ Yeni admin kullanıcısı başarıyla oluşturuldu:", {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }
  } catch (error) {
    console.error("❌ Admin oluşturulurken hata oluştu:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

createAdmin();
