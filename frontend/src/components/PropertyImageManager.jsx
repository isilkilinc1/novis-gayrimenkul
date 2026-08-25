import { useState, useEffect, useCallback } from "react";
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

  // Fotoğrafları yükle
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPropertyImages(propertyId);
      setImages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchImages();
    }
  }, [propertyId, fetchImages]);

  // Dosya seçme ve yükleme
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setUploading(true);
      setError("");
      await uploadPropertyImages(propertyId, formData);
      await fetchImages(); // Listeyi yenile
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = null; // Inputu sıfırla
    }
  };

  // Fotoğraf silme
  const handleDelete = async (imageId) => {
    if (!window.confirm("Bu fotoğrafı silmek istediğinize emin misiniz?"))
      return;

    try {
      await deletePropertyImage(propertyId, imageId);
      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Kapak fotoğrafı yapma
  const handleSetCover = async (imageId) => {
    try {
      await setCoverImage(propertyId, imageId);
      // State'i güncelle (is_cover değerlerini ayarla)
      setImages(
        images.map((img) => ({
          ...img,
          is_cover: img.id === imageId,
        })),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 my-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          İlan Fotoğrafları
        </h3>

        {/* Dosya Yükleme Butonu */}
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
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

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Fotoğraflar yükleniyor...</p>
      ) : images.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">
            Bu ilana henüz fotoğraf yüklenmemiş.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group border rounded-lg overflow-hidden bg-gray-50 shadow-xs"
            >
              <img
                src={`http://localhost:5000${img.image_url}`}
                alt="İlan Görseli"
                className="w-full h-32 object-cover"
              />

              {/* Kapak Rozeti */}
              {img.is_cover && (
                <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-md font-medium shadow-xs">
                  ⭐ Kapak
                </span>
              )}

              {/* Aksiyon Butonları */}
              <div className="p-2 flex justify-between items-center bg-white border-t border-gray-100">
                {!img.is_cover ? (
                  <button
                    type="button"
                    onClick={() => handleSetCover(img.id)}
                    className="text-xs text-blue-600 hover:underline font-medium"
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
