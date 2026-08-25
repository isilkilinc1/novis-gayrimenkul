const pool = require("../config/database");

// 1. A) YENİ: Arama, filtreler ve pagination ile aktif ilanları getir (Ziyaretçiler / Public site için)
const getAllActiveProperties = async (queryParams = {}) => {
  const {
    search,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    minSquareMeters,
    maxSquareMeters,
    rooms,
    city,
    district,
    page = 1,
    limit = 12,
  } = queryParams;

  let query = "SELECT * FROM properties WHERE status = 'ACTIVE'";
  let countQuery = "SELECT COUNT(*) FROM properties WHERE status = 'ACTIVE'";
  const values = [];
  const countValues = [];

  // 1. Arama (Search) Filtresi (title, description, city, district, neighborhood içinde arar)
  if (search) {
    const searchTerm = `%${search}%`;
    values.push(searchTerm);
    countValues.push(searchTerm);
    query += ` AND (title ILIKE $${values.length} OR description ILIKE $${values.length} OR city ILIKE $${values.length} OR district ILIKE $${values.length} OR neighborhood ILIKE $${values.length})`;
    countQuery += ` AND (title ILIKE $${countValues.length} OR description ILIKE $${countValues.length} OR city ILIKE $${countValues.length} OR district ILIKE $${countValues.length} OR neighborhood ILIKE $${countValues.length})`;
  }

  // 2. Gayrimenkul Türü (HOUSE, LAND, COMMERCIAL)
  if (propertyType) {
    values.push(propertyType);
    countValues.push(propertyType);
    query += ` AND property_type = $${values.length}`;
    countQuery += ` AND property_type = $${countValues.length}`;
  }

  // 3. İlan Türü (SALE, RENT)
  if (listingType) {
    values.push(listingType);
    countValues.push(listingType);
    query += ` AND listing_type = $${values.length}`;
    countQuery += ` AND listing_type = $${countValues.length}`;
  }

  // 4. Minimum Fiyat
  if (minPrice) {
    values.push(minPrice);
    countValues.push(minPrice);
    query += ` AND price >= $${values.length}`;
    countQuery += ` AND price >= $${countValues.length}`;
  }

  // 5. Maksimum Fiyat
  if (maxPrice) {
    values.push(maxPrice);
    countValues.push(maxPrice);
    query += ` AND price <= $${values.length}`;
    countQuery += ` AND price <= $${countValues.length}`;
  }

  // 6. Minimum m²
  if (minSquareMeters) {
    values.push(minSquareMeters);
    countValues.push(minSquareMeters);
    query += ` AND square_meters >= $${values.length}`;
    countQuery += ` AND square_meters >= $${countValues.length}`;
  }

  // 7. Maksimum m²
  if (maxSquareMeters) {
    values.push(maxSquareMeters);
    countValues.push(maxSquareMeters);
    query += ` AND square_meters <= $${values.length}`;
    countQuery += ` AND square_meters <= $${countValues.length}`;
  }

  // 8. Oda Sayısı (Sadece Konutlar için)
  if (rooms) {
    values.push(rooms);
    countValues.push(rooms);
    query += ` AND rooms = $${values.length}`;
    countQuery += ` AND rooms = $${countValues.length}`;
  }

  // 9. Şehir
  if (city) {
    values.push(city);
    countValues.push(city);
    query += ` AND city = $${values.length}`;
    countQuery += ` AND city = $${countValues.length}`;
  }

  // 10. İlçe
  if (district) {
    values.push(district);
    countValues.push(district);
    query += ` AND district = $${values.length}`;
    countQuery += ` AND district = $${countValues.length}`;
  }

  // Toplam kayıt sayısını alalım (Pagination hesabı için)
  const countResult = await pool.query(countQuery, countValues);
  const total = parseInt(countResult.rows[0].count, 10);

  // Pagination hesaplamaları (LIMIT ve OFFSET)
  const parsedLimit = parseInt(limit, 10) || 12;
  const parsedPage = parseInt(page, 10) || 1;
  const offset = (parsedPage - 1) * parsedLimit;

  // Sıralama ve Sayfalama ekleme
  query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(parsedLimit, offset);

  const result = await pool.query(query, values);

  return {
    data: result.rows,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
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
