require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("../src/config/database");

async function runMigration() {
  try {
    const sql1Path = path.join(__dirname, "../database/migration_add_cloudinary_public_id.sql");
    const sql1 = fs.readFileSync(sql1Path, "utf-8");
    await pool.query(sql1);

    const sql2Path = path.join(__dirname, "../database/migration_add_media_type.sql");
    if (fs.existsSync(sql2Path)) {
      const sql2 = fs.readFileSync(sql2Path, "utf-8");
      await pool.query(sql2);
    }

    console.log("Migrationlar başarıyla uygulandı.");

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
