const pool = require("../config/database");

// =====================================================
// TÜM İLETİŞİM TALEPLERİNİ GETİR
// Admin için
// =====================================================

const getAllContactRequests = async () => {
  const query = `
    SELECT
      cr.*,
      p.title AS property_title
    FROM contact_requests cr
    LEFT JOIN properties p
      ON cr.property_id = p.id
    ORDER BY cr.created_at DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

// =====================================================
// YENİ İLETİŞİM TALEBİ OLUŞTUR
// Public
// =====================================================

const createContactRequest = async (data) => {
  const { name, phone, email, message, property_id } = data;

  const query = `
    INSERT INTO contact_requests (
      name,
      phone,
      email,
      message,
      property_id,
      status,
      created_at,
      updated_at
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      'NEW',
      NOW(),
      NOW()
    )
    RETURNING *
  `;

  const values = [
    name,
    phone || null,
    email || null,
    message,
    property_id || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

// =====================================================
// DURUM GÜNCELLE
// Admin
// =====================================================

const updateContactRequestStatus = async (id, status) => {
  const query = `
    UPDATE contact_requests
    SET
      status = $1,
      updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [status, id]);

  return result.rows[0];
};

// =====================================================
// TALEP SİL
// Admin
// =====================================================

const deleteContactRequest = async (id) => {
  const query = `
    DELETE FROM contact_requests
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

module.exports = {
  getAllContactRequests,
  createContactRequest,
  updateContactRequestStatus,
  deleteContactRequest,
};
