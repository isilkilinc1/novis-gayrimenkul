const pool = require("./src/config/database");

async function checkSchema() {
  try {
    const result = await pool.query(`
      SELECT
          column_name,
          data_type,
          numeric_precision,
          numeric_scale,
          is_nullable
      FROM information_schema.columns
      WHERE table_name = 'properties'
      ORDER BY ordinal_position;
    `);

    console.table(result.rows);
  } catch (error) {
    console.error("ŞEMA HATASI:", error);
  } finally {
    await pool.end();
  }
}

checkSchema();
