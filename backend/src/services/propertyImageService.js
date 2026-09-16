const pool = require("../config/database");

class PropertyImageService {
  static async getImagesByPropertyId(propertyId) {
    const query = `
      SELECT *
      FROM property_images
      WHERE property_id = $1
      ORDER BY display_order ASC, id ASC;
    `;

    const result = await pool.query(query, [propertyId]);
    return result.rows;
  }

  static async addImage(
    propertyId,
    imageUrl,
    cloudinaryPublicId = null,
    isCover = false,
    displayOrder = 0,
  ) {
    const query = `
      INSERT INTO property_images
      (
        property_id,
        image_url,
        cloudinary_public_id,
        is_cover,
        display_order
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      propertyId,
      imageUrl,
      cloudinaryPublicId,
      isCover,
      displayOrder,
    ]);

    return result.rows[0];
  }

  static async getImageById(imageId) {
    const query = `
      SELECT *
      FROM property_images
      WHERE id = $1;
    `;

    const result = await pool.query(query, [imageId]);
    return result.rows[0];
  }

  static async deleteImage(imageId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const deleteResult = await client.query(
        `
        DELETE FROM property_images
        WHERE id = $1
        RETURNING *;
        `,
        [imageId],
      );

      const deletedImage = deleteResult.rows[0];

      // Eğer silinen fotoğraf kapak fotoğrafıysa ve ilanın başka fotoğrafları varsa,
      // ilk sıradaki fotoğrafı otomatik kapak yap
      if (deletedImage && deletedImage.is_cover) {
        const remainingImages = await client.query(
          `
          SELECT id
          FROM property_images
          WHERE property_id = $1
          ORDER BY display_order ASC, id ASC
          LIMIT 1;
          `,
          [deletedImage.property_id],
        );

        if (remainingImages.rows.length > 0) {
          await client.query(
            `
            UPDATE property_images
            SET is_cover = TRUE
            WHERE id = $1;
            `,
            [remainingImages.rows[0].id],
          );
        }
      }

      await client.query("COMMIT");
      return deletedImage;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async setCoverImage(propertyId, imageId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        UPDATE property_images
        SET is_cover = FALSE
        WHERE property_id = $1;
        `,
        [propertyId],
      );

      const result = await client.query(
        `
        UPDATE property_images
        SET is_cover = TRUE
        WHERE id = $2
          AND property_id = $1
        RETURNING *;
        `,
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

  static async updateImageOrder(items) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      for (const item of items) {
        await client.query(
          `
          UPDATE property_images
          SET display_order = $1
          WHERE id = $2;
          `,
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
