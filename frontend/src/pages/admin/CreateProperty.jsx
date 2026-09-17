import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProperty,
  uploadPropertyImages,
} from "../../services/propertyService";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import AdminPropertyMap from "../../components/AdminPropertyMap";

function CreateProperty() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fotoğraf ve Video Medya state'i: { id, file, previewUrl, isVideo, isCover, name }
  const [mediaFiles, setMediaFiles] = useState([]);

  // Preview URL'leri unmount durumunda temizle
  const mediaFilesRef = useRef(mediaFiles);
  useEffect(() => {
    mediaFilesRef.current = mediaFiles;
  }, [mediaFiles]);

  useEffect(() => {
    return () => {
      mediaFilesRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const [formData, setFormData] = useState({
    property_type: "HOUSE",
    title: "",
    description: "",
    listing_type: "SALE",
    status: "ACTIVE",
    price: "",
    city: "İstanbul",
    district: "Kadıköy",
    neighborhood: "",
    address: "",
    rooms: "3+1",
    square_meters: "",
    floor: "",
    building_age: "",
    heating_type: "Kombi",
    balcony: false,
    latitude: "",
    longitude: "",
  });

  // Türüne göre dinamik başlık placeholder'ı
  const getTitlePlaceholder = () => {
    switch (formData.property_type) {
      case "LAND":
        return "Örn. Beykoz'da Yatırımlık 1200m² Arsa";
      case "COMMERCIAL":
        return "Örn. Kadıköy Şehir Merkezinde Kiralık Dükkan";
      default:
        return "Örn. Beşiktaş'ta Lüks 3+1 Daire";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocationSelect = ({
    latitude,
    longitude,
    city,
    district,
    neighborhood,
    address,
    updateAddress,
  }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latitude.toFixed(7),
      longitude: longitude.toFixed(7),
      ...(updateAddress
        ? {
            city: city || prev.city,
            district: district || prev.district,
            neighborhood: neighborhood || prev.neighborhood,
            address: address || prev.address,
          }
        : {}),
    }));
  };

  // Medya dosyaları ekleme fonksiyonu
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file) => {
      const isVideo =
        file.type.startsWith("video/") ||
        Boolean(file.name.match(/\.(mp4|webm|mov|avi|mkv)$/i));
      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo,
        isCover: false,
        name: file.name,
      };
    });

    setMediaFiles((prev) => {
      const combined = [...prev, ...newItems];
      const hasPhoto = combined.some((item) => !item.isVideo);

      if (hasPhoto) {
        // Eğer en az bir fotoğraf varsa, kapak sadece fotoğraflardan olabilir
        const hasCoverPhoto = combined.some((item) => !item.isVideo && item.isCover);
        if (!hasCoverPhoto) {
          const firstPhotoIndex = combined.findIndex((item) => !item.isVideo);
          if (firstPhotoIndex !== -1) {
            combined.forEach((item, idx) => {
              item.isCover = idx === firstPhotoIndex;
            });
          }
        } else {
          // Videolardan isCover'ı kaldır
          combined.forEach((item) => {
            if (item.isVideo) item.isCover = false;
          });
        }
      } else if (combined.length > 0) {
        // İlanda HİÇ FOTOĞRAF YOKSA, ilk video otomatik kapak medya olur
        combined.forEach((item, idx) => {
          item.isCover = idx === 0;
        });
      }

      return combined;
    });

    // Input alanını sıfırla ki aynı dosya tekrar seçilebilsin
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Medya öğesini silme
  const handleRemoveMedia = (idToRemove) => {
    setMediaFiles((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const filtered = prev.filter((item) => item.id !== idToRemove);

      const hasPhoto = filtered.some((item) => !item.isVideo);

      if (hasPhoto) {
        // Fotoğraf varsa, kapak sadece fotoğraftan seçilir
        const hasCoverPhoto = filtered.some((item) => !item.isVideo && item.isCover);
        if (!hasCoverPhoto) {
          const firstPhotoIndex = filtered.findIndex((item) => !item.isVideo);
          if (firstPhotoIndex !== -1) {
            filtered[firstPhotoIndex].isCover = true;
          }
        }
        filtered.forEach((item) => {
          if (item.isVideo) item.isCover = false;
        });
      } else if (filtered.length > 0) {
        // Fotoğraf kalmadıysa ilk video otomatik kapak olur
        filtered.forEach((item, idx) => {
          item.isCover = idx === 0;
        });
      }

      return filtered;
    });
  };

  // Kapak fotoğrafı seçme (Sadece fotoğraflar için)
  const handleSelectCover = (id) => {
    setMediaFiles((prev) =>
      prev.map((item) => {
        if (item.isVideo) {
          return { ...item, isCover: false };
        }
        return {
          ...item,
          isCover: item.id === id,
        };
      }),
    );
  };

  // Sıralama değiştirme (sol / yukarı)
  const handleMoveLeft = (index) => {
    if (index === 0) return;
    setMediaFiles((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Sıralama değiştirme (sağ / aşağı)
  const handleMoveRight = (index) => {
    setMediaFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const [uploadStatus, setUploadStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setUploadStatus("İlan bilgileri kaydediliyor...");

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        square_meters: formData.square_meters
          ? Number(formData.square_meters)
          : null,
        floor: formData.floor ? Number(formData.floor) : null,
        building_age: formData.building_age
          ? Number(formData.building_age)
          : null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
      };

      // 1. Önce ilanı oluştur ve yeni ilanın ID'sini al
      const newProperty = await createProperty(payload);
      const newPropertyId = newProperty.id;

      // 2. Eğer kullanıcı medya (fotoğraf/video) seçtiyse, medyaları tek tek güvenle yükle
      if (mediaFiles.length > 0 && newPropertyId) {
        const total = mediaFiles.length;
        const failedFiles = [];

        for (let i = 0; i < total; i++) {
          const item = mediaFiles[i];
          setUploadStatus(
            `Medyalar yükleniyor (${i + 1} / ${total}): ${item.name}...`,
          );

          const formDataImages = new FormData();
          formDataImages.append("images", item.file);
          if (item.isCover && !item.isVideo) {
            formDataImages.append("isCover", "true");
          }

          try {
            await uploadPropertyImages(newPropertyId, formDataImages);
          } catch (fileErr) {
            console.error(`Medya yükleme hatası (${item.name}):`, fileErr);
            failedFiles.push(item.name);
          }
        }

        if (failedFiles.length > 0) {
          alert(
            `İlan başarıyla oluşturuldu ancak şu ${failedFiles.length} dosya yüklenemedi: ${failedFiles.join(", ")}. İlanı düzenleyerek tekrar ekleyebilirsiniz.`,
          );
        }
      }

      navigate("/admin/ilanlar");
    } catch (err) {
      console.error("İlan oluşturma hatası:", err);
      setError(
        err.response?.data?.message ||
          "İlan oluşturulurken veya medyalar yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  const photoCount = mediaFiles.filter((m) => !m.isVideo).length;
  const videoCount = mediaFiles.filter((m) => m.isVideo).length;

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-novis-anthracite">
              Yeni İlan Ekle
            </h1>
            <p className="mt-1 text-sm text-novis-brown">
              Sisteme yeni bir gayrimenkul ilanı kaydetmek, fotoğraf ve video eklemek
              için formu doldurun.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/ilanlar")}
          >
            İptal
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-novis-bronze/20 shadow-sm space-y-6"
        >
          <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/20">
            <label className="block text-sm font-bold text-novis-anthracite mb-2">
              Gayrimenkul Türü *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["HOUSE", "LAND", "COMMERCIAL"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, property_type: type }))
                  }
                  className={`py-2.5 px-4 rounded-lg text-sm font-medium transition border ${
                    formData.property_type === type
                      ? "bg-novis-anthracite text-white border-novis-anthracite"
                      : "bg-white text-novis-anthracite border-novis-bronze/30 hover:bg-gray-50"
                  }`}
                >
                  {type === "HOUSE"
                    ? "🏠 Konut"
                    : type === "LAND"
                      ? "🌳 Arsa"
                      : "🏪 İşyeri"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label="İlan Başlığı *"
              name="title"
              placeholder={getTitlePlaceholder()}
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-novis-anthracite mb-2">
              Açıklama *
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Gayrimenkul hakkında detaylı bilgi giriniz..."
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite placeholder-gray-400 focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-novis-anthracite mb-2">
                İlan Türü *
              </label>
              <select
                name="listing_type"
                value={formData.listing_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
              >
                <option value="SALE">Satılık</option>
                <option value="RENT">Kiralık</option>
              </select>
            </div>
            <div>
              <Input
                label="Fiyat (TL) *"
                name="price"
                type="number"
                placeholder="Örn. 3500000"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Şehir *"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <Input
              label="İlçe *"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
            />
            <Input
              label="Mahalle"
              name="neighborhood"
              placeholder="Örn. Yazır"
              value={formData.neighborhood}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Açık Adres"
            name="address"
            placeholder="Açık adres detayları..."
            value={formData.address}
            onChange={handleChange}
          />

          {/* 📍 HARİTA VE KONUM SEÇİMİ */}
          <div className="p-4 bg-novis-cream/20 rounded-xl border border-novis-bronze/20">
            <AdminPropertyMap
              latitude={formData.latitude}
              longitude={formData.longitude}
              city={formData.city}
              district={formData.district}
              neighborhood={formData.neighborhood}
              address={formData.address}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {formData.property_type === "LAND" ? (
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Metrekare (m²) *"
                name="square_meters"
                type="number"
                placeholder="1200"
                value={formData.square_meters}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Input
                  label="Metrekare (m²)"
                  name="square_meters"
                  type="number"
                  placeholder="180"
                  value={formData.square_meters}
                  onChange={handleChange}
                />

                {formData.property_type === "HOUSE" && (
                  <Input
                    label="Oda Sayısı"
                    name="rooms"
                    type="text"
                    placeholder="Örn. 3+1"
                    value={formData.rooms}
                    onChange={handleChange}
                  />
                )}

                <Input
                  label="Bulunduğu Kat"
                  name="floor"
                  type="number"
                  placeholder="5"
                  value={formData.floor}
                  onChange={handleChange}
                />
                <Input
                  label="Bina Yaşı"
                  name="building_age"
                  type="number"
                  placeholder="3"
                  value={formData.building_age}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-novis-anthracite mb-2">
                    Isıtma Tipi
                  </label>
                  <select
                    name="heating_type"
                    value={formData.heating_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
                  >
                    <option value="Kombi">Kombi (Doğalgaz)</option>
                    <option value="Merkezi">Merkezi</option>
                    <option value="Yerden Isıtma">Yerden Isıtma</option>
                    <option value="Klima">Klima</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                {formData.property_type === "HOUSE" && (
                  <div className="pt-6 sm:pt-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="balcony"
                        checked={formData.balcony}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-gray-300 text-novis-bronze focus:ring-novis-bronze"
                      />
                      <span className="text-sm font-medium text-novis-anthracite">
                        Balkon Var
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 📸 FOTOĞRAF VE VİDEO YÜKLEME ALANI */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-novis-anthracite">
                  İlan Medyaları (Fotoğraf & Video)
                </label>
                <p className="text-xs text-novis-brown mt-0.5">
                  Birden fazla fotoğraf ve video seçebilirsiniz. Fotoğraflardan birini kapak fotoğrafı olarak belirleyebilirsiniz (videolar kapak fotoğrafı olamaz).
                </p>
              </div>
              <label
                className="cursor-pointer bg-novis-anthracite hover:bg-black text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition shrink-0"
              >
                <span>+ Medya Seç</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-matroska,video/x-msvideo"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Önizleme Listesi */}
            {mediaFiles.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-novis-bronze/50 rounded-xl p-8 text-center bg-gray-50/70 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="text-3xl mb-2">📸 🎬</div>
                <p className="text-sm font-medium text-novis-anthracite">
                  Fotoğraf veya video yüklemek için buraya tıklayın ya da dosyaları seçin
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, WEBP, MP4, WEBM, MOV formatları desteklenir.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3 text-xs font-medium text-novis-brown">
                  <span>
                    Toplam {mediaFiles.length} medya ({photoCount} Fotoğraf, {videoCount} Video)
                  </span>
                  <span>
                    ⭐ Kapak Medya:{" "}
                    <strong className="text-novis-anthracite">
                      {photoCount > 0
                        ? mediaFiles.find((m) => !m.isVideo && m.isCover)?.name ||
                          "İlk fotoğraf varsayılan olacaktır"
                        : mediaFiles.find((m) => m.isVideo && m.isCover)?.name
                          ? `${mediaFiles.find((m) => m.isVideo && m.isCover)?.name} (Otomatik Video Kapak)`
                          : "Seçilmedi"}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaFiles.map((item, index) => (
                    <div
                      key={item.id}
                      className={`relative group rounded-xl overflow-hidden border transition bg-white shadow-xs ${
                        item.isCover
                          ? "border-amber-500 ring-2 ring-amber-400/40"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Medya Önizlemesi */}
                      <div className="relative h-32 w-full bg-black flex items-center justify-center">
                        {item.isVideo ? (
                          <video
                            src={item.previewUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.previewUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Rozetler */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                          {item.isVideo ? (
                            <span className="bg-purple-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                              🎬 Video
                            </span>
                          ) : (
                            <span className="bg-blue-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                              📷 Fotoğraf
                            </span>
                          )}

                          {item.isCover && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                              {item.isVideo ? "⭐ Kapak Video" : "⭐ Kapak"}
                            </span>
                          )}
                        </div>

                        {/* Sil Butonu */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item.id)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow transition"
                          title="Kaldır"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Alt Kontroller / Sıralama & Kapak Yap */}
                      <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveLeft(index)}
                            disabled={index === 0}
                            className="w-6 h-6 rounded bg-white hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 transition"
                            title="Sola taşı"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRight(index)}
                            disabled={index === mediaFiles.length - 1}
                            className="w-6 h-6 rounded bg-white hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 transition"
                            title="Sağa taşı"
                          >
                            ▶
                          </button>
                        </div>

                        {!item.isVideo ? (
                          !item.isCover ? (
                            <button
                              type="button"
                              onClick={() => handleSelectCover(item.id)}
                              className="text-[11px] font-medium text-amber-700 hover:text-amber-900 hover:underline"
                            >
                              Kapak Yap
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-600">
                              Kapak Foto
                            </span>
                          )
                        ) : item.isCover ? (
                          <span className="text-[10px] text-amber-600 font-bold">
                            Otomatik Kapak
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">
                            Video
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {uploadStatus && (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-sm flex items-center gap-3 animate-pulse">
              <span className="text-xl">⏳</span>
              <div>
                <p className="font-semibold">{uploadStatus}</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Lütfen işlem tamamlanana kadar sayfayı kapatmayın.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading
                ? uploadStatus || "Kaydediliyor..."
                : "İlanı Kaydet ve Medyaları Yükle"}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}

export default CreateProperty;
