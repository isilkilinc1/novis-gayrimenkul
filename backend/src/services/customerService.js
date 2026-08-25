const pool = require("../config/database");

// Tüm müşterileri listele
const getAllCustomers = async () => {
  const result = await pool.query(
    "SELECT * FROM customers ORDER BY created_at DESC",
  );
  return result.rows;
};

// ID'ye göre tek müşteri getir
const getCustomerById = async (id) => {
  const result = await pool.query("SELECT * FROM customers WHERE id = $1", [
    id,
  ]);
  return result.rows[0];
};

// Yeni müşteri oluştur
const createCustomer = async (data) => {
  const { name, phone, email, budget, demand, status, notes } = data;
  const result = await pool.query(
    `INSERT INTO customers (name, phone, email, budget, demand, status, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [name, phone, email, budget || null, demand, status || "NEW", notes],
  );
  return result.rows[0];
};

// Müşteriyi güncelle
const updateCustomer = async (id, data) => {
  const { name, phone, email, budget, demand, status, notes } = data;
  const result = await pool.query(
    `UPDATE customers 
     SET name = $1, phone = $2, email = $3, budget = $4, demand = $5, status = $6, notes = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [name, phone, email, budget || null, demand, status, notes, id],
  );
  return result.rows[0];
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
