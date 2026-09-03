const pool = require("../config/database");

const getSiteSettings = async () => {
  const result = await pool.query(`
    SELECT
      id,
      about_title,
      about_content,
      phone,
      email,
      created_at,
      updated_at
    FROM site_settings
    WHERE id = 1
    LIMIT 1
  `);

  if (result.rows.length === 0) {
    throw new Error("Site ayarları bulunamadı.");
  }

  return result.rows[0];
};

const updateSiteSettings = async ({
  about_title,
  about_content,
  phone,
  email,
}) => {
  const result = await pool.query(
    `
    UPDATE site_settings
    SET
      about_title = $1,
      about_content = $2,
      phone = $3,
      email = $4,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
    RETURNING
      id,
      about_title,
      about_content,
      phone,
      email,
      created_at,
      updated_at
    `,
    [about_title, about_content, phone, email],
  );

  if (result.rows.length === 0) {
    throw new Error("Site ayarları güncellenemedi.");
  }

  return result.rows[0];
};

module.exports = {
  getSiteSettings,
  updateSiteSettings,
};
