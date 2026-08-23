const pool = require("../config/database");

// 1. A) YENİ: Sadece aktif (ACTIVE) ilanları filtrelerle birlikte getir (Ziyaretçiler / Public site için)
const getAllActiveProperties = async (queryParams = {}) => {
  const {
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    minSquareMeters,
    maxSquareMeters,
    rooms,
    city,
    district,
  } = queryParams;

  let query = "SELECT * FROM properties WHERE status = 'ACTIVE'";
  const values = [];

  // 1. Gayrimenkul Türü (HOUSE, LAND, COMMERCIAL)
  if (propertyType) {
    values.push(propertyType);
    query += ` AND property_type = $${values.length}`;
  }

  // 2. İlan Türü (SALE, RENT)
  if (listingType) {
    values.push(listingType);
    query += ` AND listing_type = $${values.length}`;
  }

  // 3. Minimum Fiyat
  if (minPrice) {
    values.push(minPrice);
    query += ` AND price >= $${values.length}`;
  }

  // 4. Maksimum Fiyat
  if (maxPrice) {
    values.push(maxPrice);
    query += ` AND price <= $${values.length}`;
  }

  // 5. Minimum m²
  if (minSquareMeters) {
    values.push(minSquareMeters);
    query += ` AND square_meters >= $${values.length}`;
  }

  // 6. Maksimum m²
  if (maxSquareMeters) {
    values.push(maxSquareMeters);
    query += ` AND square_meters <= $${values.length}`;
  }

  // 7. Oda Sayısı (Sadece Konutlar için)
  if (rooms) {
    values.push(rooms);
    query += ` AND rooms = $${values.length}`;
  }

  // 8. Şehir
  if (city) {
    values.push(city);
    query += ` AND city = $${values.length}`;
  }

  // 9. İlçe
  if (district) {
    values.push(district);
    query += ` AND district = $${values.length}`;
  }

  // Sıralama: En yeni ilan en üstte
  query += " ORDER BY created_at DESC";

  const result = await pool.query(query, values);
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
