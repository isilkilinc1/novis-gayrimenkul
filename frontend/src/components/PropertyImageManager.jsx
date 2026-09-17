import { useState, useEffect } from "react";

import {
  getPropertyImages,
  uploadPropertyImages,
  deletePropertyImage,
  setCoverImage,
} from "../services/propertyService";
import { getFullImageUrl } from "../utils/imageUrl";

export default function PropertyImageManager({ propertyId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // MEDYALARI (FOTOĞRAF VE VİDEO) GETİR
  // ======================================================

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    let cancelled = false;

    const loadImages = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPropertyImages(propertyId);

        if (!cancelled) {
          setImages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Medyaları getirme hatası:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Medyalar yüklenirken bir hata oluştu.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  // ======================================================
  // MEDYA (FOTOĞRAF / VİDEO) YÜKLE
  // ======================================================

  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setError("");

      const failedFiles = [];
      const total = files.length;

      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadStatus(
          `Yükleniyor (${i + 1}/${total}): ${file.name}...`,
        );

        const formData = new FormData();
        formData.append("images", file);

        try {
          await uploadPropertyImages(propertyId, formData);
        } catch (fileErr) {
          console.error(`Dosya yükleme hatası (${file.name}):`, fileErr);
          failedFiles.push(file.name);
        }
      }

      // Yükleme tamamlandıktan sonra medyaları yeniden getir
      const data = await getPropertyImages(propertyId);
      setImages(Array.isArray(data) ? data : []);

      if (failedFiles.length > 0) {
        setError(
          `Şu ${failedFiles.length} dosya yüklenemedi: ${failedFiles.join(", ")}. Diğer dosyalar başarıyla yüklendi.`,
        );
      }
    } catch (err) {
      console.error("Medya yükleme hatası:", err);
      setError(
        err.response?.data?.message ||
          "Medyalar yüklenirken bir hata oluştu.",
      );
    } finally {
      setUploading(false);
      setUploadStatus("");

      // Aynı dosyayı tekrar seçebilmek için input'u sıfırla
      e.target.value = "";
    }
  };

  // ======================================================
  // MEDYA SİL
  // ======================================================

  const handleDelete = async (mediaItem) => {
    const isVideo =
      mediaItem.media_type === "video" ||
      Boolean(mediaItem.image_url?.match(/\.(mp4|webm|mov|avi|mkv)$/i));

    const confirmed = window.confirm(
      isVideo
        ? "Bu videoyu silmek istediğinize emin misiniz?"
        : "Bu fotoğrafı silmek istediğinize emin misiniz?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deletePropertyImage(propertyId, mediaItem.id);

      // Silindikten sonra güncel listeyi yeniden çekelim (eğer kapak silindiyse yeni kapak backend tarafından atanmış olur)
      const data = await getPropertyImages(propertyId);
      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Medya silme hatası:", err);

      setError(
        err.response?.data?.message || "Medya silinirken bir hata oluştu.",
      );
    }
  };

  // ======================================================
  // KAPAK FOTOĞRAFI YAP (SADECE FOTOĞRAFLAR)
  // ======================================================

  const handleSetCover = async (imageId) => {
    try {
      setError("");

      await setCoverImage(propertyId, imageId);

      // Kapak fotoğrafını state içerisinde güncelle
      setImages((currentImages) =>
        currentImages.map((img) => ({
          ...img,
          is_cover: img.id === imageId,
        })),
      );
    } catch (err) {
      console.error("Kapak fotoğrafı değiştirme hatası:", err);

      setError(
        err.response?.data?.message ||
          "Kapak fotoğrafı değiştirilirken bir hata oluştu.",
      );
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  const photoCount = images.filter((m) => m.media_type !== "video").length;
  const videoCount = images.filter((m) => m.media_type === "video").length;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 my-6">
      {/* BAŞLIK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            İlan Medyaları (Fotoğraf & Video)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Mevcut: {photoCount} Fotoğraf, {videoCount} Video. Kapak fotoğrafı yalnızca fotoğraflardan seçilebilir.
          </p>
        </div>

        {/* MEDYA YÜKLE */}
        <label
          className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 self-start sm:self-auto ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>
            {uploading ? uploadStatus || "Yükleniyor..." : "+ Medya Yükle"}
          </span>

          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* HATA */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* YÜKLENİYOR */}
      {loading ? (
        <p className="text-gray-500 text-sm">Medyalar yükleniyor...</p>
      ) : images.length === 0 ? (
        /* MEDYA YOK */
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">
            Bu ilana henüz fotoğraf veya video yüklenmemiş.
          </p>
        </div>
      ) : (
        /* MEDYALAR GRID */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => {
            const isVideo =
              img.media_type === "video" ||
              Boolean(img.image_url?.match(/\.(mp4|webm|mov|avi|mkv)$/i));

            return (
              <div
                key={img.id}
                className={`relative group border rounded-lg overflow-hidden bg-gray-50 shadow-sm ${
                  img.is_cover ? "border-amber-500 ring-2 ring-amber-400/40" : "border-gray-200"
                }`}
              >
                {/* MEDYA ALANI */}
                <div className="relative h-32 w-full bg-black flex items-center justify-center">
                  {isVideo ? (
                    <video
                      src={getFullImageUrl(img.image_url)}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={getFullImageUrl(img.image_url)}
                      alt="İlan Görseli"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* ROZETLER */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                    {isVideo ? (
                      <span className="bg-purple-700 text-white text-[10px] px-2 py-0.5 rounded font-semibold shadow">
                        🎬 Video
                      </span>
                    ) : (
                      <span className="bg-blue-700 text-white text-[10px] px-2 py-0.5 rounded font-semibold shadow">
                        📷 Fotoğraf
                      </span>
                    )}

                    {img.is_cover && (
                      <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-medium shadow">
                        ⭐ Kapak
                      </span>
                    )}
                  </div>
                </div>

                {/* AKSİYONLAR */}
                <div className="p-2 flex justify-between items-center bg-white border-t border-gray-100">
                  {!isVideo ? (
                    !img.is_cover ? (
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        Kapak Yap
                      </button>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold">
                        Kapak Fotoğrafı
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-gray-400 font-medium italic">
                      Video
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(img)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
