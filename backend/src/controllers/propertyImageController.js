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

  // Medya yükle (Fotoğraf & Video)
  static async uploadImages(req, res, next) {
    const uploadedFiles = req.files && req.files.length > 0
      ? req.files
      : (req.file ? [req.file] : []);

    try {
      const { propertyId } = req.params;
      const numericPropertyId = parseInt(propertyId, 10);

      if (!numericPropertyId || isNaN(numericPropertyId)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz ilan ID'si.",
        });
      }

      if (uploadedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Lütfen en az bir dosya seçin.",
        });
      }

      const existingImages =
        await PropertyImageService.getImagesByPropertyId(numericPropertyId);

      const hasExistingCover = existingImages.some(
        (img) => img.is_cover && img.media_type !== "video",
      );

      const explicitIsCover =
        req.body.isCover === true ||
        req.body.isCover === "true" ||
        req.body.is_cover === true ||
        req.body.is_cover === "true";

      const coverIndex =
        req.body.coverIndex !== undefined && req.body.coverIndex !== ""
          ? Number(req.body.coverIndex)
          : null;

      const coverFileName = req.body.coverFileName || null;

      let coverAssignedInBatch = false;
      const savedImages = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        const isVideo =
          file.mimetype?.startsWith("video/") ||
          /\.(mp4|webm|mov|avi|mkv)$/i.test(file.originalname);

        const mediaType = isVideo ? "video" : "image";

        // Cloudinary veya Local URL
        const imageUrl = file.path?.startsWith("http")
          ? file.path
          : `/uploads/properties/${numericPropertyId}/${file.filename}`;

        // Cloudinary public ID
        const cloudinaryPublicId = file.path?.startsWith("http")
          ? file.filename
          : null;

        // Kapak fotoğrafı mantığı (Videolar asla kapak olamaz)
        let isCover = false;
        if (!isVideo) {
          if (explicitIsCover) {
            isCover = true;
            coverAssignedInBatch = true;
          } else if (coverIndex !== null && coverIndex === i) {
            isCover = true;
            coverAssignedInBatch = true;
          } else if (coverFileName && file.originalname === coverFileName) {
            isCover = true;
            coverAssignedInBatch = true;
          } else if (!hasExistingCover && !coverAssignedInBatch) {
            isCover = true;
            coverAssignedInBatch = true;
          }
        }

        const displayOrder = existingImages.length + i + 1;

        const newImage = await PropertyImageService.addImage(
          numericPropertyId,
          imageUrl,
          cloudinaryPublicId,
          isCover,
          displayOrder,
          mediaType,
        );

        savedImages.push(newImage);
      }

      res.status(201).json({
        success: true,
        message: "Medyalar başarıyla yüklendi.",
        data: savedImages,
      });
    } catch (error) {
      // Yükleme sırasında hata olursa Cloudinary'e yüklenmiş geçici medyaları temizle
      if (uploadedFiles && uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          if (file.path?.startsWith("http") && file.filename) {
            const isVideo =
              file.mimetype?.startsWith("video/") ||
              /\.(mp4|webm|mov|avi|mkv)$/i.test(file.originalname);

            try {
              await cloudinary.uploader.destroy(file.filename, {
                resource_type: isVideo ? "video" : "image",
              });
            } catch (cleanupErr) {
              console.error("Geçici dosya temizleme hatası:", cleanupErr.message);
            }
          }
        }
      }

      next(error);
    }
  }

  // Medya sil (Fotoğraf / Video)
  static async deleteImage(req, res, next) {
    try {
      const { imageId } = req.params;
      const numericImageId = parseInt(imageId, 10);

      if (!numericImageId || isNaN(numericImageId)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz medya ID'si.",
        });
      }

      const image = await PropertyImageService.getImageById(numericImageId);

      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Medya bulunamadı.",
        });
      }

      const isVideo = image.media_type === "video";
      const resourceType = isVideo ? "video" : "image";

      // Cloudinary dosyalarını silmeyi dene
      if (image.cloudinary_public_id) {
        try {
          await cloudinary.uploader.destroy(image.cloudinary_public_id, {
            resource_type: resourceType,
          });
        } catch (cloudErr) {
          console.warn("Cloudinary public_id silme uyarısı:", cloudErr.message);
        }
      } else if (image.image_url?.includes("cloudinary.com")) {
        const publicId = getCloudinaryPublicIdFromUrl(image.image_url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId, {
              resource_type: resourceType,
            });
          } catch (cloudErr) {
            console.warn("Cloudinary URL publicId silme uyarısı:", cloudErr.message);
          }
        }
      }
      // Eski lokal dosyalar için geriye dönük destek
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
        message: "Medya başarıyla silindi.",
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

  // Medya indir (Fotoğraf & Video)
  static async downloadImage(req, res, next) {
    try {
      const { imageId } = req.params;
      const numericImageId = parseInt(imageId, 10);

      if (!numericImageId || isNaN(numericImageId)) {
        return res.status(400).json({
          success: false,
          message: "Geçersiz medya ID'si.",
        });
      }

      const image = await PropertyImageService.getImageById(numericImageId);

      if (!image || !image.image_url) {
        return res.status(404).json({
          success: false,
          message: "Medya bulunamadı.",
        });
      }

      const isVideo = image.media_type === "video";
      const extMatch = image.image_url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      const ext = extMatch
        ? extMatch[1]
        : isVideo
          ? "mp4"
          : "jpg";
      const defaultFilename = `ilan-${image.property_id}-${isVideo ? "video" : "fotograf"}-${image.id}.${ext}`;
      const filename = req.query.filename || defaultFilename;

      if (
        image.image_url.startsWith("http://") ||
        image.image_url.startsWith("https://")
      ) {
        const https = image.image_url.startsWith("https")
          ? require("https")
          : require("http");

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(filename)}"`,
        );

        https
          .get(image.image_url, (stream) => {
            if (stream.headers["content-type"]) {
              res.setHeader("Content-Type", stream.headers["content-type"]);
            }
            stream.pipe(res);
          })
          .on("error", (err) => {
            next(err);
          });
      } else {
        const filePath = path.join(__dirname, "../..", image.image_url);
        if (fs.existsSync(filePath)) {
          return res.download(filePath, filename);
        } else {
          return res.status(404).json({
            success: false,
            message: "Dosya bulunamadı.",
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PropertyImageController;
