require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/config/database");

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, "../database/migration_add_cloudinary_public_id.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("Migration başlatılıyor...");
    await pool.query(sql);
    console.log("Migration başarıyla uygulandı.");

    // Kontrol et
    const check = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'property_images'
      ORDER BY ordinal_position;
    `);

    console.log("Güncel property_images şeması:");
    console.table(check.rows);
  } catch (error) {
    console.error("Migration hatası:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
