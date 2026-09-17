const pool = require("../config/database");

// Tüm müşterileri listele
const getAllCustomers = async () => {
  const result = await pool.query(`
    SELECT 
      c.*,
      p.title AS property_title
    FROM customers c
    LEFT JOIN properties p ON c.property_id = p.id
    ORDER BY c.created_at DESC
  `);

  return result.rows.map((row) => ({
    ...row,
    name: row.full_name,
    demand: row.request_type || row.notes,
  }));
};

// ID'ye göre tek müşteri getir
const getCustomerById = async (id) => {
  const result = await pool.query(
    `
    SELECT 
      c.*,
      p.title AS property_title
    FROM customers c
    LEFT JOIN properties p ON c.property_id = p.id
    WHERE c.id = $1
    `,
    [id],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...row,
    name: row.full_name,
    demand: row.request_type,
  };
};

// Yeni müşteri oluştur
const createCustomer = async (data) => {
  const {
    name,
    phone,
    email,
    budget,
    demand,
    status,
    notes,
    property_id,
    propertyId,
  } = data;

  const resolvedPropertyId =
    property_id !== undefined && property_id !== "" && property_id !== null
      ? Number(property_id)
      : propertyId !== undefined && propertyId !== "" && propertyId !== null
        ? Number(propertyId)
        : null;

  const result = await pool.query(
    `INSERT INTO customers (full_name, phone, email, budget, request_type, status, notes, property_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING *`,
    [
      name,
      phone,
      email,
      budget || null,
      demand,
      status || "NEW",
      notes,
      resolvedPropertyId,
    ],
  );

  const row = result.rows[0];
  let propertyTitle = null;
  if (row.property_id) {
    const propRes = await pool.query(
      "SELECT title FROM properties WHERE id = $1",
      [row.property_id],
    );
    if (propRes.rows.length > 0) {
      propertyTitle = propRes.rows[0].title;
    }
  }

  return {
    ...row,
    name: row.full_name,
    demand: row.request_type,
    property_title: propertyTitle,
  };
};

// Müşteriyi güncelle
const updateCustomer = async (id, data) => {
  const {
    name,
    phone,
    email,
    budget,
    demand,
    status,
    notes,
    property_id,
    propertyId,
  } = data;

  const resolvedPropertyId =
    property_id !== undefined && property_id !== "" && property_id !== null
      ? Number(property_id)
      : propertyId !== undefined && propertyId !== "" && propertyId !== null
        ? Number(propertyId)
        : null;

  const result = await pool.query(
    `UPDATE customers 
     SET full_name = $1, phone = $2, email = $3, budget = $4, request_type = $5, status = $6, notes = $7, property_id = $8, updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [
      name,
      phone,
      email,
      budget || null,
      demand,
      status,
      notes,
      resolvedPropertyId,
      id,
    ],
  );

  const row = result.rows[0];
  if (!row) return null;

  let propertyTitle = null;
  if (row.property_id) {
    const propRes = await pool.query(
      "SELECT title FROM properties WHERE id = $1",
      [row.property_id],
    );
    if (propRes.rows.length > 0) {
      propertyTitle = propRes.rows[0].title;
    }
  }

  return {
    ...row,
    name: row.full_name,
    demand: row.request_type,
    property_title: propertyTitle,
  };
};

// Müşteri sil
const deleteCustomer = async (id) => {
  const result = await pool.query(
    "DELETE FROM customers WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0];
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};

