import { useState, useEffect } from "react";

import {
  getPropertyImages,
  uploadPropertyImages,
  deletePropertyImage,
  setCoverImage,
} from "../services/propertyService";

export default function PropertyImageManager({ propertyId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // FOTOĞRAFLARI GETİR
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
        console.error("Fotoğrafları getirme hatası:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Fotoğraflar yüklenirken bir hata oluştu.",
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
  // FOTOĞRAF YÜKLE
  // ======================================================

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setUploading(true);
      setError("");

      await uploadPropertyImages(propertyId, formData);

      // Yükleme tamamlandıktan sonra fotoğrafları yeniden getir
      const data = await getPropertyImages(propertyId);

      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fotoğraf yükleme hatası:", err);

      setError(
        err.response?.data?.message ||
          "Fotoğraflar yüklenirken bir hata oluştu.",
      );
    } finally {
      setUploading(false);

      // Aynı dosyayı tekrar seçebilmek için input'u sıfırla
      e.target.value = "";
    }
  };

  // ======================================================
  // FOTOĞRAF SİL
  // ======================================================

  const handleDelete = async (imageId) => {
    const confirmed = window.confirm(
      "Bu fotoğrafı silmek istediğinize emin misiniz?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deletePropertyImage(imageId);

      // State'i fonksiyonel olarak güncelle
      setImages((currentImages) =>
        currentImages.filter((img) => img.id !== imageId),
      );
    } catch (err) {
      console.error("Fotoğraf silme hatası:", err);

      setError(
        err.response?.data?.message || "Fotoğraf silinirken bir hata oluştu.",
      );
    }
  };

  // ======================================================
  // KAPAK FOTOĞRAFI YAP
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 my-6">
      {/* BAŞLIK */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          İlan Fotoğrafları
        </h3>

        {/* FOTOĞRAF YÜKLE */}
        <label
          className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>{uploading ? "Yükleniyor..." : "+ Fotoğraf Yükle"}</span>

          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
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
        <p className="text-gray-500 text-sm">Fotoğraflar yükleniyor...</p>
      ) : images.length === 0 ? (
        /* FOTOĞRAF YOK */
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">
            Bu ilana henüz fotoğraf yüklenmemiş.
          </p>
        </div>
      ) : (
        /* FOTOĞRAFLAR */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm"
            >
              {/* FOTOĞRAF */}
              <div className="relative">
                <img
                  src={`http://localhost:5000${img.image_url}`}
                  alt="İlan Görseli"
                  className="w-full h-32 object-cover"
                />

                {/* KAPAK ROZETİ */}
                {img.is_cover && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-md font-medium shadow">
                    ⭐ Kapak
                  </span>
                )}
              </div>

              {/* AKSİYONLAR */}
              <div className="p-2 flex justify-between items-center bg-white border-t border-gray-100">
                {!img.is_cover ? (
                  <button
                    type="button"
                    onClick={() => handleSetCover(img.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    Kapak Yap
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 font-medium">
                    Kapak Fotoğrafı
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
