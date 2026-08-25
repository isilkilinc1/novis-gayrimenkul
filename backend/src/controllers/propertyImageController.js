const PropertyImageService = require("../services/propertyImageService");
const fs = require("fs");
const path = require("path");

class PropertyImageController {
  // Fotoğrafları listele
  static async getImages(req, res, next) {
    try {
      const { propertyId } = req.params;
      const images =
        await PropertyImageService.getImagesByPropertyId(propertyId);
      res.json({ success: true, data: images });
    } catch (error) {
      next(error);
    }
  }

  // Fotoğraf yükle (Çoklu yükleme desteği: upload.array("images"))
  static async uploadImages(req, res, next) {
    try {
      const { propertyId } = req.params;

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Lütfen en az bir fotoğraf seçin.",
          });
      }

      // Mevcut fotoğrafları kontrol et (İlk fotoğraf mı?)
      const existingImages =
        await PropertyImageService.getImagesByPropertyId(propertyId);
      let isFirstImage = existingImages.length === 0;

      const savedImages = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        // Dosya yolunu public URL formatına dönüştür
        const imageUrl = `/uploads/properties/${propertyId}/${file.filename}`;

        // Eğer hiç fotoğraf yoksa ilk yüklenen otomatik kapak olsun
        const isCover = isFirstImage && i === 0;
        const displayOrder = existingImages.length + i + 1;

        const newImage = await PropertyImageService.addImage(
          propertyId,
          imageUrl,
          isCover,
          displayOrder,
        );
        savedImages.push(newImage);
      }

      res.status(201).json({
        success: true,
        message: "Fotoğraflar başarıyla yüklendi.",
        data: savedImages,
      });
    } catch (error) {
      next(error);
    }
  }

  // Fotoğraf sil
  static async deleteImage(req, res, next) {
    try {
      const { imageId } = req.params;
      const image = await PropertyImageService.getImageById(imageId);

      if (!image) {
        return res
          .status(404)
          .json({ success: false, message: "Fotoğraf bulunamadı." });
      }

      // Fiziksel dosyayı bilgisayardan sil
      const filePath = path.join(__dirname, "../..", image.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Veritabanından sil
      await PropertyImageService.deleteImage(imageId);

      res.json({ success: true, message: "Fotoğraf başarıyla silindi." });
    } catch (error) {
      next(error);
    }
  }

  // Kapak fotoğrafı yap
  static async setCover(req, res, next) {
    try {
      const { propertyId, imageId } = req.params;
      const updated = await PropertyImageService.setCoverImage(
        propertyId,
        imageId,
      );

      if (!updated) {
        return res
          .status(404)
          .json({ success: false, message: "Fotoğraf bulunamadı." });
      }

      res.json({
        success: true,
        message: "Kapak fotoğrafı güncellendi.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // Sıralamayı değiştir
  static async reorderImages(req, res, next) {
    try {
      const { items } = req.body; // [{id, display_order}, ...]
      if (!Array.isArray(items)) {
        return res
          .status(400)
          .json({ success: false, message: "Geçersiz veri formatı." });
      }

      await PropertyImageService.updateImageOrder(items);
      res.json({ success: true, message: "Fotoğraf sıralaması güncellendi." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PropertyImageController;
