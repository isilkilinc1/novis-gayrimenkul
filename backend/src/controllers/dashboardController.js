const pool = require("../config/database");

const getDashboardStats = async (req, res) => {
  try {
    // 1. İlan istatistikleri (Toplam, Aktif, Satılık, Kiralık, Satılan, Kiralanan)
    const totalPropertiesQuery = await pool.query(
      "SELECT COUNT(*) FROM properties",
    );
    const activePropertiesQuery = await pool.query(
      "SELECT COUNT(*) FROM properties WHERE status = 'ACTIVE'",
    );
    const forSaleQuery = await pool.query(
      "SELECT COUNT(*) FROM properties WHERE listing_type = 'SALE'",
    );
    const forRentQuery = await pool.query(
      "SELECT COUNT(*) FROM properties WHERE listing_type = 'RENT'",
    );
    const soldQuery = await pool.query(
      "SELECT COUNT(*) FROM properties WHERE status = 'SOLD'",
    );
    const rentedQuery = await pool.query(
      "SELECT COUNT(*) FROM properties WHERE status = 'RENTED'",
    );

    // 2. Müşteri istatistikleri
    const totalCustomersQuery = await pool.query(
      "SELECT COUNT(*) FROM customers",
    );

    // 3. İletişim talepleri (Yeni olanlar)
    const newContactRequestsQuery = await pool.query(
      "SELECT COUNT(*) FROM contact_requests WHERE status = 'NEW'",
    );

    res.json({
      totalProperties: parseInt(totalPropertiesQuery.rows[0].count),
      activeProperties: parseInt(activePropertiesQuery.rows[0].count),
      forSale: parseInt(forSaleQuery.rows[0].count),
      forRent: parseInt(forRentQuery.rows[0].count),
      sold: parseInt(soldQuery.rows[0].count),
      rented: parseInt(rentedQuery.rows[0].count),
      totalCustomers: parseInt(totalCustomersQuery.rows[0].count),
      newContactRequests: parseInt(newContactRequestsQuery.rows[0].count),
    });
  } catch (error) {
    console.error("Dashboard istatistikleri alınırken hata:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

module.exports = {
  getDashboardStats,
};
