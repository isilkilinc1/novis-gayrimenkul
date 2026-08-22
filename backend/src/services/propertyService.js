const pool = require("../config/database");

// 1. A) YENİ: Sadece aktif (ACTIVE) ilanları getir (Ziyaretçiler / Public site için)
const getAllActiveProperties = async () => {
  const result = await pool.query(`
    SELECT *
    FROM properties
    WHERE status = 'ACTIVE'
    ORDER BY created_at DESC
  `);
  return result.rows;
};

// 1. B) Tüm ilanları getir (Admin paneli için - Bütün status'ler dahil)
const getAllProperties = async () => {
  const result = await pool.query(`
    SELECT *
    FROM properties
    ORDER BY created_at DESC
  `);
  return result.rows;
};

// 2. ID'ye göre tek ilan getir
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

// 3. Yeni ilan oluştur (CREATE)
const createProperty = async (propertyData) => {
  const {
    property_type,
    title,
    description,
    listing_type,
    status,
    price,
    city,
    district,
    neighborhood,
    address,
    rooms,
    square_meters,
    floor,
    building_age,
    heating_type,
    balcony,
    latitude,
    longitude,
  } = propertyData;

  const result = await pool.query(
    `
    INSERT INTO properties (
      property_type, title, description, listing_type, status, price,
      city, district, neighborhood, address, rooms,
      square_meters, floor, building_age, heating_type,
      balcony, latitude, longitude
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18
    )
    RETURNING *
    `,
    [
      property_type || "HOUSE",
      title,
      description,
      listing_type,
      status || "ACTIVE",
      price,
      city,
      district,
      neighborhood,
      address,
      rooms,
      square_meters,
      floor,
      building_age,
      heating_type,
      balcony,
      latitude,
      longitude,
    ],
  );

  return result.rows[0];
};

// 4. İlanı güncelle (UPDATE)
const updateProperty = async (id, propertyData) => {
  const {
    property_type,
    title,
    description,
    listing_type,
    status,
    price,
    city,
    district,
    neighborhood,
    address,
    rooms,
    square_meters,
    floor,
    building_age,
    heating_type,
    balcony,
    latitude,
    longitude,
  } = propertyData;

  const result = await pool.query(
    `
    UPDATE properties
    SET
      property_type = $1, title = $2, description = $3, listing_type = $4, status = $5, price = $6,
      city = $7, district = $8, neighborhood = $9, address = $10, rooms = $11,
      square_meters = $12, floor = $13, building_age = $14, heating_type = $15,
      balcony = $16, latitude = $17, longitude = $18,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $19
    RETURNING *
    `,
    [
      property_type || "HOUSE",
      title,
      description,
      listing_type,
      status,
      price,
      city,
      district,
      neighborhood,
      address,
      rooms,
      square_meters,
      floor,
      building_age,
      heating_type,
      balcony,
      latitude,
      longitude,
      id,
    ],
  );

  return result.rows[0];
};

// 5. Sadece ilanın durumunu (status) güncelleyen fonksiyon
const updatePropertyStatus = async (id, status) => {
  const result = await pool.query(
    `
    UPDATE properties
    SET status = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
    `,
    [status, id],
  );

  return result.rows[0];
};

// 6. İlanı sil (DELETE)
const deleteProperty = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM properties
    WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return result.rows[0];
};

module.exports = {
  getAllActiveProperties,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
};
