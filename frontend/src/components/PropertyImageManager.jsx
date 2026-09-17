import { useState, useEffect } from "react";

import {
  getPropertyImages,
  uploadPropertyImages,
  deletePropertyImage,
  setCoverImage,
  downloadPropertyImage,
} from "../services/propertyService";
import { getFullImageUrl } from "../utils/imageUrl";

export default function PropertyImageManager({ propertyId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
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
  // MEDYA (FOTOĞRAF / VİDEO) İNDİR
  // ======================================================

  const handleDownload = async (img, index) => {
    const isVideo =
      img.media_type === "video" ||
      Boolean(img.image_url?.match(/\.(mp4|webm|mov|avi|mkv)$/i));

    const rawUrl = getFullImageUrl(img.image_url);
    const extMatch = rawUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const ext = extMatch
      ? extMatch[1].toLowerCase()
      : isVideo
        ? "mp4"
        : "jpg";

    const filename = `ilan-${propertyId}-${isVideo ? "video" : "fotograf"}-${index + 1}.${ext}`;

    try {
      setDownloadingId(img.id);
      setError("");

      let downloaded = false;
      try {
        const res = await fetch(rawUrl, { mode: "cors" });
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(a);
          downloaded = true;
        }
      } catch (fetchErr) {
        console.warn(
          "Doğrudan fetch ile indirme başarısız, backend servisi deneniyor...",
          fetchErr,
        );
      }

      if (!downloaded) {
        await downloadPropertyImage(propertyId, img.id, filename);
      }
    } catch (err) {
      console.error("Medya indirme hatası:", err);

      try {
        const fallbackA = document.createElement("a");
        fallbackA.href = rawUrl;
        fallbackA.download = filename;
        fallbackA.target = "_blank";
        fallbackA.rel = "noopener noreferrer";
        document.body.appendChild(fallbackA);
        fallbackA.click();
        document.body.removeChild(fallbackA);
      } catch {
        setError(
          err.response?.data?.message ||
            "Medya indirilirken bir sorun oluştu.",
        );
      }
    } finally {
      setDownloadingId(null);
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
            Mevcut: {photoCount} Fotoğraf, {videoCount} Video.{" "}
            {photoCount === 0 && videoCount > 0
              ? "İlanda fotoğraf olmadığı için ilk video otomatik kapak medya olarak kullanılır."
              : "Kapak fotoğrafı fotoğraflar arasından seçilir."}
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
          {images.map((img, index) => {
            const isVideo =
              img.media_type === "video" ||
              Boolean(img.image_url?.match(/\.(mp4|webm|mov|avi|mkv)$/i));

            const isFallbackVideoCover =
              photoCount === 0 && isVideo && index === 0;

            const isCover = img.is_cover || isFallbackVideoCover;

            return (
              <div
                key={img.id}
                className={`relative group border rounded-lg overflow-hidden bg-gray-50 shadow-sm ${
                  isCover ? "border-amber-500 ring-2 ring-amber-400/40" : "border-gray-200"
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

                    {isCover && (
                      <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-medium shadow">
                        {isVideo ? "⭐ Kapak Video" : "⭐ Kapak"}
                      </span>
                    )}
                  </div>
                </div>

                {/* AKSİYONLAR */}
                <div className="p-2 flex justify-between items-center gap-1.5 bg-white border-t border-gray-100">
                  <div className="flex-1 min-w-0">
                    {!isVideo ? (
                      !img.is_cover ? (
                        <button
                          type="button"
                          onClick={() => handleSetCover(img.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium truncate block cursor-pointer"
                        >
                          Kapak Yap
                        </button>
                      ) : (
                        <span className="text-xs text-amber-600 font-semibold truncate block">
                          Kapak Fotoğrafı
                        </span>
                      )
                    ) : isFallbackVideoCover ? (
                      <span className="text-xs text-amber-600 font-semibold truncate block">
                        Otomatik Kapak
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium italic truncate block">
                        Video
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* İNDİR BUTONU (KÜÇÜK KARE İKON) */}
                    <button
                      type="button"
                      disabled={downloadingId === img.id}
                      onClick={() => handleDownload(img, index)}
                      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 hover:bg-novis-cream hover:border-novis-bronze/40 text-gray-700 hover:text-novis-anthracite transition text-xs cursor-pointer disabled:opacity-50"
                      title={isVideo ? "Videoyu indir" : "Fotoğrafı indir"}
                      aria-label={isVideo ? "Videoyu indir" : "Fotoğrafı indir"}
                    >
                      {downloadingId === img.id ? (
                        <span className="animate-spin text-[10px]">⏳</span>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      )}
                    </button>

                    {/* SİL BUTONU */}
                    <button
                      type="button"
                      onClick={() => handleDelete(img)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
