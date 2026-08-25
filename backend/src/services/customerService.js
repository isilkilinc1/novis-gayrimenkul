const pool = require("../config/database");

// Tüm müşterileri listele
const getAllCustomers = async () => {
  const result = await pool.query(
    "SELECT * FROM customers ORDER BY created_at DESC",
  );
  // Frontend'in rahat kullanabilmesi için full_name'i name, demand'i request_type map'leyebiliriz
  // veya doğrudan veritabanı alan adlarını dönebiliriz.
  return result.rows.map((row) => ({
    ...row,
    name: row.full_name,
    demand: row.request_type || row.notes, // Talep alanı için fallback
  }));
};

// ID'ye göre tek müşteri getir
const getCustomerById = async (id) => {
  const result = await pool.query("SELECT * FROM customers WHERE id = $1", [
    id,
  ]);
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
  const { name, phone, email, budget, demand, status, notes } = data;
  const result = await pool.query(
    `INSERT INTO customers (full_name, phone, email, budget, request_type, status, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [name, phone, email, budget || null, demand, status || "NEW", notes],
  );
  const row = result.rows[0];
  return {
    ...row,
    name: row.full_name,
    demand: row.request_type,
  };
};

// Müşteriyi güncelle
const updateCustomer = async (id, data) => {
  const { name, phone, email, budget, demand, status, notes } = data;
  const result = await pool.query(
    `UPDATE customers 
     SET full_name = $1, phone = $2, email = $3, budget = $4, request_type = $5, status = $6, notes = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [name, phone, email, budget || null, demand, status, notes, id],
  );
  const row = result.rows[0];
  return {
    ...row,
    name: row.full_name,
    demand: row.request_type,
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
