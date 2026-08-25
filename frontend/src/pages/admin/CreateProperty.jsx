import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProperty,
  uploadPropertyImages,
} from "../../services/propertyService";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function CreateProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 📸 Yeni: Fotoğraf state'leri
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    property_type: "HOUSE",
    title: "",
    description: "",
    listing_type: "SALE",
    status: "ACTIVE",
    price: "",
    city: "Konya",
    district: "Selçuklu",
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
        return "Örn. Meram'da Yatırımlık 1200m² Arsa";
      case "COMMERCIAL":
        return "Örn. Şehir Merkezinde Kiralık Dükkan";
      default:
        return "Örn. Selçuklu'da Lüks 3+1 Daire";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📸 Dosya seçim fonksiyonu
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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

      // 1. Önce ilanı oluştur ve yeni ilanın verisini al (id'si içinde gelecek)
      const newProperty = await createProperty(payload);
      const newPropertyId = newProperty.id;

      // 2. Eğer kullanıcı fotoğraf seçtiyse, yeni oluşan ilan ID'sine fotoğrafları yükle
      if (selectedFiles.length > 0 && newPropertyId) {
        const formDataImages = new FormData();
        selectedFiles.forEach((file) => {
          formDataImages.append("images", file);
        });
        await uploadPropertyImages(newPropertyId, formDataImages);
      }

      navigate("/admin/ilanlar");
    } catch (err) {
      console.error("İlan oluşturma hatası:", err);
      setError(
        err.response?.data?.message ||
          "İlan oluşturulurken veya fotoğraflar yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-novis-anthracite">
              Yeni İlan Ekle
            </h1>
            <p className="mt-1 text-sm text-novis-brown">
              Sisteme yeni bir gayrimenkul ilanı kaydetmek ve fotoğraf eklemek
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
                  <div>
                    <label className="block text-sm font-medium text-novis-anthracite mb-2">
                      Oda Sayısı
                    </label>
                    <select
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
                    >
                      <option value="1+0">1+0</option>
                      <option value="1+1">1+1</option>
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                      <option value="5+1">5+1</option>
                    </select>
                  </div>
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

          {/* 📸 YENİ İLAN OLUŞTURURKEN FOTOĞRAF YÜKLEME ALANI */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-bold text-novis-anthracite mb-2">
              İlan Fotoğrafları (İsteğe Bağlı)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-novis-anthracite file:text-white hover:file:bg-black cursor-pointer"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-xs text-novis-bronze font-medium">
                  ✓ {selectedFiles.length} fotoğraf seçildi. İlk yüklenen kapak
                  fotoğrafı olacaktır.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading
                ? "Kaydediliyor..."
                : "İlanı Kaydet ve Fotoğrafları Yükle"}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}

export default CreateProperty;
