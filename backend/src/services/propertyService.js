const pool = require("../config/database");

// 1. Tüm ilanları getir
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
      title, description, listing_type, status, price,
      city, district, neighborhood, address, rooms,
      square_meters, floor, building_age, heating_type,
      balcony, latitude, longitude
    )
    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17
    )
    RETURNING *
    `,
    [
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
      title = $1, description = $2, listing_type = $3, status = $4, price = $5,
      city = $6, district = $7, neighborhood = $8, address = $9, rooms = $10,
      square_meters = $11, floor = $12, building_age = $13, heating_type = $14,
      balcony = $15, latitude = $16, longitude = $17,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $18
    RETURNING *
    `,
    [
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
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
};
