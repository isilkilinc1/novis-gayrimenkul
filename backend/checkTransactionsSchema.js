const pool = require("./src/config/database");

const checkSchema = async () => {
  try {
    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'property_transactions'
      ORDER BY ordinal_position;
    `);

    console.log("\n=== property_transactions TABLOSU ===");

    if (result.rows.length === 0) {
      console.log("property_transactions tablosu BULUNAMADI.");
    } else {
      console.table(result.rows);
    }

    console.log("\n=== FOREIGN KEYLER ===");

    const fkResult = await pool.query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'property_transactions';
    `);

    console.table(fkResult.rows);
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await pool.end();
  }
};

checkSchema();
