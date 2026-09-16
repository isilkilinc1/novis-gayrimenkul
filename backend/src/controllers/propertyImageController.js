const PropertyImageService = require("../services/propertyImageService");
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const path = require("path");

const getCloudinaryPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    const versionMatch = afterUpload.match(/(?:^|\/)v\d+\/(.+)$/);
    const pathWithExt = versionMatch ? versionMatch[1] : afterUpload;
    const dot = pathWithExt.lastIndexOf(".");
    return dot !== -1 ? pathWithExt.substring(0, dot) : pathWithExt;
  } catch {
    return null;
  }
};

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

class PropertyImageController {
  // Fotoğrafları listele
  static async getImages(req, res, next) {
    try {
      const { propertyId } = req.params;
      const numericPropertyId = parseInt(propertyId, 10);

      if (!numericPropertyId || isNaN(numericPropertyId)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz ilan ID'si.",
        });
      }

      const images =
        await PropertyImageService.getImagesByPropertyId(numericPropertyId);

      res.json({
        success: true,
        data: images,
      });
    } catch (error) {
      next(error);
    }
  }

  // Fotoğraf yükle
  static async uploadImages(req, res, next) {
    try {
      const { propertyId } = req.params;
      const numericPropertyId = parseInt(propertyId, 10);

      if (!numericPropertyId || isNaN(numericPropertyId)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz ilan ID'si.",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Lütfen en az bir fotoğraf seçin.",
        });
      }

      const existingImages =
        await PropertyImageService.getImagesByPropertyId(numericPropertyId);

      const isFirstImage = existingImages.length === 0;
      const savedImages = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        // Cloudinary veya Local URL
        const imageUrl = file.path?.startsWith("http")
          ? file.path
          : `/uploads/properties/${numericPropertyId}/${file.filename}`;

        // Cloudinary public ID
        const cloudinaryPublicId = file.path?.startsWith("http")
          ? file.filename
          : null;

        // İlk fotoğraf otomatik kapak
        const isCover = isFirstImage && i === 0;

        const displayOrder = existingImages.length + i + 1;

        const newImage = await PropertyImageService.addImage(
          numericPropertyId,
          imageUrl,
          cloudinaryPublicId,
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
      // Yükleme sırasında hata olursa Cloudinary'e yüklenmiş geçici görselleri temizle
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          if (file.path?.startsWith("http") && file.filename) {
            try {
              await cloudinary.uploader.destroy(file.filename);
            } catch (cleanupErr) {
              console.error("Geçici dosya temizleme hatası:", cleanupErr.message);
            }
          }
        }
      }
      next(error);
    }
  }

  // Fotoğraf sil
  static async deleteImage(req, res, next) {
    try {
      const { imageId } = req.params;
      const numericImageId = parseInt(imageId, 10);

      if (!numericImageId || isNaN(numericImageId)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz fotoğraf ID'si.",
        });
      }

      const image = await PropertyImageService.getImageById(numericImageId);

      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Fotoğraf bulunamadı.",
        });
      }

      // Cloudinary fotoğraflarını silmeyi dene
      if (image.cloudinary_public_id) {
        try {
          await cloudinary.uploader.destroy(image.cloudinary_public_id);
        } catch (cloudErr) {
          console.warn("Cloudinary public_id silme uyarısı:", cloudErr.message);
        }
      } else if (image.image_url?.includes("cloudinary.com")) {
        const publicId = getCloudinaryPublicIdFromUrl(image.image_url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudErr) {
            console.warn("Cloudinary URL publicId silme uyarısı:", cloudErr.message);
          }
        }
      }
      // Eski lokal fotoğraflar için geriye dönük destek
      else if (image.image_url?.startsWith("/uploads/")) {
        try {
          const filePath = path.join(__dirname, "../..", image.image_url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fsErr) {
          console.warn("Lokal dosya silme uyarısı:", fsErr.message);
        }
      }

      // Veritabanından sil
      await PropertyImageService.deleteImage(numericImageId);

      res.json({
        success: true,
        message: "Fotoğraf başarıyla silindi.",
      });
    } catch (error) {
      next(error);
    }
  }

  // Kapak fotoğrafı yap
  static async setCover(req, res, next) {
    try {
      const { propertyId, imageId } = req.params;
      const numericPropertyId = parseInt(propertyId, 10);
      const numericImageId = parseInt(imageId, 10);

      if (!numericImageId || isNaN(numericImageId)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz fotoğraf ID'si.",
        });
      }

      const updated = await PropertyImageService.setCoverImage(
        numericPropertyId,
        numericImageId,
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Fotoğraf bulunamadı.",
        });
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
      const { items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz veri formatı.",
        });
      }

      await PropertyImageService.updateImageOrder(items);

      res.json({
        success: true,
        message: "Fotoğraf sıralaması güncellendi.",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PropertyImageController;
