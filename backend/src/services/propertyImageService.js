const pool = require("../config/database");

class PropertyImageService {
  // 1. Bir ilana ait fotoğrafları getir
  static async getImagesByPropertyId(propertyId) {
    const query = `
      SELECT * FROM property_images 
      WHERE property_id = $1 
      ORDER BY display_order ASC, id ASC;
    `;
    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  // 2. Fotoğraf veritabanına kaydet
  static async addImage(propertyId, imageUrl, isCover, displayOrder) {
    const query = `
      INSERT INTO property_images (property_id, image_url, is_cover, display_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [
      propertyId,
      imageUrl,
      isCover,
      displayOrder,
    ]);
    return result.rows[0];
  }

  // 3. Tek bir fotoğrafı ID ile bul
  static async getImageById(imageId) {
    const query = `SELECT * FROM property_images WHERE id = $1;`;
    const result = await pool.query(query, [imageId]);
    return result.rows[0];
  }

  // 4. Fotoğraf sil
  static async deleteImage(imageId) {
    const query = `DELETE FROM property_images WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [imageId]);
    return result.rows[0];
  }

  // 5. Kapak fotoğrafı güncelle (Önce tümünü false yap, seçileni true yap)
  static async setCoverImage(propertyId, imageId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // İlgili ilanın tüm fotoğraflarının is_cover değerini false yap
      await client.query(
        `UPDATE property_images SET is_cover = FALSE WHERE property_id = $1;`,
        [propertyId],
      );

      // Seçilen fotoğrafı true yap
      const result = await client.query(
        `UPDATE property_images SET is_cover = TRUE WHERE id = $2 AND property_id = $1 RETURNING *;`,
        [propertyId, imageId],
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // 6. Sıralama güncelle (Reorder)
  static async updateImageOrder(items) {
    // items: [{ id: 1, display_order: 1 }, { id: 2, display_order: 2 }, ...]
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const item of items) {
        await client.query(
          `UPDATE property_images SET display_order = $1 WHERE id = $2;`,
          [item.display_order, item.id],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = PropertyImageService;
