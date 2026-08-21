const pool = require("../config/database");

// 1. Tüm ilanları veritabanından çekme
const getAllProperties = async () => {
  const result = await pool.query(`
    SELECT *
    FROM properties
    ORDER BY created_at DESC
  `);

  return result.rows;
};

// 2. ID'ye göre tek bir ilanı çekme (Güvenli parametrik sorgu $1 ile)
const getPropertyById = async (id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM properties
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};

module.exports = {
  getAllProperties,
  getPropertyById,
};
