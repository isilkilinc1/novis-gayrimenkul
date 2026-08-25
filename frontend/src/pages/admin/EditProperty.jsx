import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPropertyById,
  updateProperty,
} from "../../services/propertyService";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PropertyImageManager from "../../components/PropertyImageManager";

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    property_type: "HOUSE",
    title: "",
    description: "",
    listing_type: "SALE",
    status: "ACTIVE",
    price: "",
    city: "",
    district: "",
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

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await getPropertyById(id);
        setFormData({
          property_type: data.property_type || "HOUSE",
          title: data.title || "",
          description: data.description || "",
          listing_type: data.listing_type || "SALE",
          status: data.status || "ACTIVE",
          price: data.price || "",
          city: data.city || "",
          district: data.district || "",
          neighborhood: data.neighborhood || "",
          address: data.address || "",
          rooms: data.rooms || "3+1",
          square_meters: data.square_meters || "",
          floor: data.floor || "",
          building_age: data.building_age || "",
          heating_type: data.heating_type || "Kombi",
          balcony: data.balcony || false,
          latitude: data.latitude || "",
          longitude: data.longitude || "",
        });
      } catch (err) {
        console.error("İlan bilgileri yüklenirken hata:", err);
        setError("İlan bulunamadı veya yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

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

      await updateProperty(id, payload);
      navigate("/admin/ilanlar");
    } catch (err) {
      console.error("İlan güncelleme hatası:", err);
      setError(
        err.response?.data?.message || "İlan güncellenirken bir hata oluştu.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 text-novis-brown">
          İlan bilgileri yükleniyor...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-novis-anthracite">
              İlanı Düzenle
            </h1>
            <p className="mt-1 text-sm text-novis-brown">
              Mevcut gayrimenkul ilan bilgilerini ve konumunu güncelleyin.
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
          {/* Gayrimenkul Türü Seçimi */}
          <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/20">
            <label className="block text-sm font-bold text-novis-anthracite mb-2">
              Gayrimenkul Türü *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, property_type: "HOUSE" }))
                }
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition border ${
                  formData.property_type === "HOUSE"
                    ? "bg-novis-anthracite text-white border-novis-anthracite"
                    : "bg-white text-novis-anthracite border-novis-bronze/30 hover:bg-gray-50"
                }`}
              >
                🏠 Konut
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, property_type: "LAND" }))
                }
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition border ${
                  formData.property_type === "LAND"
                    ? "bg-novis-anthracite text-white border-novis-anthracite"
                    : "bg-white text-novis-anthracite border-novis-bronze/30 hover:bg-gray-50"
                }`}
              >
                🌳 Arsa
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    property_type: "COMMERCIAL",
                  }))
                }
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition border ${
                  formData.property_type === "COMMERCIAL"
                    ? "bg-novis-anthracite text-white border-novis-anthracite"
                    : "bg-white text-novis-anthracite border-novis-bronze/30 hover:bg-gray-50"
                }`}
              >
                🏪 İşyeri
              </button>
            </div>
          </div>

          <div>
            <Input
              label="İlan Başlığı *"
              name="title"
              placeholder="Örn. Selçuklu'da Lüks 3+1 Daire"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-novis-anthracite mb-2">
                Durum *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Yayından Kaldır</option>
                <option value="SOLD">Satıldı</option>
                <option value="RENTED">Kiralandı</option>
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

          {/* 📍 HARİTA KOORDİNATLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-novis-cream/20 rounded-xl border border-novis-bronze/20">
            <Input
              label="Enlem (Latitude)"
              name="latitude"
              type="number"
              step="any"
              placeholder="Örn. 37.8746"
              value={formData.latitude}
              onChange={handleChange}
            />
            <Input
              label="Boylam (Longitude)"
              name="longitude"
              type="number"
              step="any"
              placeholder="Örn. 32.4932"
              value={formData.longitude}
              onChange={handleChange}
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

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </Button>
          </div>
        </form>

        {/* İlan Fotoğraf Yönetim Alanı */}
        <div className="mt-8">
          <PropertyImageManager propertyId={id} />
        </div>
      </div>
    </Container>
  );
}

export default EditProperty;
