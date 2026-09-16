const pool = require("../config/database");

const orderByMap = {
  date_desc: "pt.transaction_date DESC NULLS LAST, pt.created_at DESC",
  date_asc: "pt.transaction_date ASC NULLS LAST, pt.created_at ASC",
  customer_asc: "c.full_name ASC NULLS LAST, pt.transaction_date DESC",
  customer_desc: "c.full_name DESC NULLS LAST, pt.transaction_date DESC",
  property_asc: "p.title ASC NULLS LAST, pt.transaction_date DESC",
  property_desc: "p.title DESC NULLS LAST, pt.transaction_date DESC",
};

const buildFilters = ({ search, transactionType, propertyType, fromDate, toDate, customerId } = {}) => {
  const values = [];
  const conditions = [];
  const add = (value, condition) => { values.push(value); conditions.push(condition(`$${values.length}`)); };
  if (search?.trim()) add(`%${search.trim()}%`, (p) => `(c.full_name ILIKE ${p} OR c.phone ILIKE ${p} OR p.title ILIKE ${p} OR p.city ILIKE ${p} OR p.district ILIKE ${p} OR p.neighborhood ILIKE ${p})`);
  if (transactionType) add(transactionType, (p) => `pt.transaction_type = ${p}`);
  if (propertyType) add(propertyType, (p) => `p.property_type = ${p}`);
  if (customerId) add(customerId, (p) => `pt.customer_id = ${p}`);
  if (fromDate) add(fromDate, (p) => `pt.transaction_date >= ${p}::date`);
  if (toDate) add(toDate, (p) => `pt.transaction_date < (${p}::date + INTERVAL '1 day')`);
  return { values, whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "" };
};

const selectTransactions = (whereClause, orderBy) => `
  SELECT pt.id, pt.property_id, pt.customer_id, pt.transaction_type, pt.transaction_date, pt.final_price, pt.notes, pt.created_at,
    p.title AS property_title, p.property_type, p.listing_type AS property_listing_type, p.city AS property_city, p.district AS property_district, p.neighborhood AS property_neighborhood, p.address AS property_address,
    c.full_name AS customer_name, c.phone AS customer_phone, c.email AS customer_email
  FROM property_transactions pt
  LEFT JOIN properties p ON p.id = pt.property_id
  LEFT JOIN customers c ON c.id = pt.customer_id
  ${whereClause}
  ORDER BY ${orderBy}
`;

const getTransactions = async (filters = {}) => {
  const { values, whereClause } = buildFilters(filters);
  const parsedPage = Math.max(Number.parseInt(filters.page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(Number.parseInt(filters.limit, 10) || 20, 1), 100);
  const totalResult = await pool.query(`SELECT COUNT(*) FROM property_transactions pt LEFT JOIN properties p ON p.id = pt.property_id LEFT JOIN customers c ON c.id = pt.customer_id ${whereClause}`, values);
  const result = await pool.query(`${selectTransactions(whereClause, orderByMap[filters.sort] || orderByMap.date_desc)} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`, [...values, parsedLimit, (parsedPage - 1) * parsedLimit]);
  const total = Number.parseInt(totalResult.rows[0].count, 10);
  return { data: result.rows, pagination: { page: parsedPage, limit: parsedLimit, total, totalPages: Math.max(Math.ceil(total / parsedLimit), 1) } };
};

const getExportTransactions = async (filters = {}) => {
  const { values, whereClause } = buildFilters(filters);
  const result = await pool.query(selectTransactions(whereClause, orderByMap[filters.sort] || orderByMap.date_desc), values);
  return result.rows;
};

const getCustomerHistory = async (customerId) => {
  const customerResult = await pool.query("SELECT id, full_name, phone, email FROM customers WHERE id = $1", [customerId]);
  if (!customerResult.rows[0]) return null;
  const data = await getExportTransactions({ customerId, sort: "date_desc" });
  const summary = data.reduce((acc, item) => ({ total: acc.total + 1, sold: acc.sold + (item.transaction_type === "SOLD" ? 1 : 0), rented: acc.rented + (item.transaction_type === "RENTED" ? 1 : 0) }), { total: 0, sold: 0, rented: 0 });
  return { customer: customerResult.rows[0], summary, data };
};

const findTransaction = async (id) => (await pool.query(selectTransactions("WHERE pt.id = $1", orderByMap.date_desc), [id])).rows[0] || null;
const customerExists = async (id) => Boolean((await pool.query("SELECT id FROM customers WHERE id = $1", [id])).rows[0]);
const updateTransaction = async (id, data) => (await pool.query("UPDATE property_transactions SET transaction_date = $1, transaction_type = $2, final_price = $3, notes = $4, customer_id = $5 WHERE id = $6 RETURNING *", [data.transactionDate, data.transactionType, data.finalPrice, data.notes || null, data.customerId, id])).rows[0] || null;
const deleteTransaction = async (id) => (await pool.query("DELETE FROM property_transactions WHERE id = $1 RETURNING id", [id])).rows[0] || null;

module.exports = { getTransactions, getExportTransactions, getCustomerHistory, findTransaction, customerExists, updateTransaction, deleteTransaction };
