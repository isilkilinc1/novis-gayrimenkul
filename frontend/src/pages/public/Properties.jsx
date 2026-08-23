import { useEffect, useState } from "react";
import Container from "../../components/ui/Container";
import PropertyCard from "../../components/PropertyCard";
import Button from "../../components/ui/Button";
import { getProperties } from "../../services/propertyService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtre State'leri
  const [filters, setFilters] = useState({
    propertyType: "",
    listingType: "",
    minPrice: "",
    maxPrice: "",
    minSquareMeters: "",
    maxSquareMeters: "",
    rooms: "",
    city: "",
    district: "",
  });

  // Backend'den filtrelenmiş ilanları çeken bağımsız async fonksiyon
  const fetchFilteredProperties = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError("");

      // Sadece dolu (değeri olan) filtreleri gönderelim
      const cleanFilters = Object.fromEntries(
        Object.entries(appliedFilters).filter(([, v]) => v !== ""),
      );

      const data = await getProperties(cleanFilters);
      setProperties(data);
    } catch (err) {
      console.error("İlanlar yüklenirken hata:", err);
      setError("İlanlar yüklenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Sayfa ilk yüklendiğinde çalışacak effect
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const data = await getProperties();
        if (isMounted) {
          setProperties(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error("İlanlar yüklenirken hata:", err);
          setError("İlanlar yüklenirken bir sorun oluştu.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Input değişikliklerini yöneten fonksiyon
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // "Filtrele" butonuna basıldığında
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchFilteredProperties(filters);
  };

  // "Filtreleri Temizle" butonuna basıldığında
  const handleReset = () => {
    const resetState = {
      propertyType: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      minSquareMeters: "",
      maxSquareMeters: "",
      rooms: "",
      city: "",
      district: "",
    };
    setFilters(resetState);
    fetchFilteredProperties(resetState);
  };

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
          NOVIS GAYRİMENKUL
        </p>

        <h1 className="mt-3 font-display text-4xl font-bold text-novis-anthracite">
          Gayrimenkul İlanları
        </h1>

        <p className="mt-4 text-novis-brown">
          Satılık ve kiralık en güncel portföyümüzü kriterlerinize göre
          filtreleyin.
        </p>

        {/* Ana Düzen: Sol Taraf Filtre Paneli, Sağ Taraf İlan Listesi */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SOL: FİLTRE PANELİ */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-novis-bronze/20 shadow-sm sticky top-24">
              <h2 className="font-display text-lg font-bold text-novis-anthracite mb-4 pb-3 border-b border-gray-100">
                Filtreler
              </h2>

              <form onSubmit={handleFilterSubmit} className="space-y-4 text-sm">
                {/* Gayrimenkul Türü */}
                <div>
                  <label className="block text-novis-brown font-medium mb-1">
                    Gayrimenkul Türü
                  </label>
                  <select
                    name="propertyType"
                    value={filters.propertyType}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 bg-white text-novis-anthracite focus:outline-none focus:border-novis-gold"
                  >
                    <option value="">Tümü</option>
                    <option value="HOUSE">Konut</option>
                    <option value="LAND">Arsa</option>
                    <option value="COMMERCIAL">Ticari</option>
                  </select>
                </div>

                {/* İlan Durumu (Satılık / Kiralık) */}
                <div>
                  <label className="block text-novis-brown font-medium mb-1">
                    İlan Durumu
                  </label>
                  <select
                    name="listingType"
                    value={filters.listingType}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 bg-white text-novis-anthracite focus:outline-none focus:border-novis-gold"
                  >
                    <option value="">Tümü</option>
                    <option value="SALE">Satılık</option>
                    <option value="RENT">Kiralık</option>
                  </select>
                </div>

                {/* Oda Sayısı (YALNIZCA Konut / HOUSE seçildiğinde görünsün) */}
                {filters.propertyType === "HOUSE" && (
                  <div>
                    <label className="block text-novis-brown font-medium mb-1">
                      Oda Sayısı
                    </label>
                    <select
                      name="rooms"
                      value={filters.rooms}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 bg-white text-novis-anthracite focus:outline-none focus:border-novis-gold"
                    >
                      <option value="">Tüm Odalar</option>
                      <option value="1+1">1+1</option>
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                      <option value="5+1">5+1</option>
                    </select>
                  </div>
                )}

                {/* Fiyat Aralığı */}
                <div>
                  <label className="block text-novis-brown font-medium mb-1">
                    Fiyat (TL)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold"
                    />
                  </div>
                </div>

                {/* Metrekare Aralığı */}
                <div>
                  <label className="block text-novis-brown font-medium mb-1">
                    Alan (m²)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="minSquareMeters"
                      placeholder="Min m²"
                      value={filters.minSquareMeters}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold"
                    />
                    <input
                      type="number"
                      name="maxSquareMeters"
                      placeholder="Max m²"
                      value={filters.maxSquareMeters}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold"
                    />
                  </div>
                </div>

                {/* Şehir ve İlçe */}
                <div>
                  <label className="block text-novis-brown font-medium mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Örn: Konya"
                    value={filters.city}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold"
                  />
                </div>

                <div>
                  <label className="block text-novis-brown font-medium mb-1">
                    İlçe
                  </label>
                  <input
                    type="text"
                    name="district"
                    placeholder="Örn: Selçuklu"
                    value={filters.district}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold"
                  />
                </div>

                {/* Butonlar */}
                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full justify-center">
                    Filtrele
                  </Button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2.5 text-center text-xs text-novis-brown hover:text-novis-anthracite font-medium transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SAĞ: İLAN LİSTESİ ALANI */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sonuç Sayısı Bildirimi */}
            <div className="bg-white px-6 py-4 rounded-2xl border border-novis-bronze/20 shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-novis-anthracite">
                {loading
                  ? "İlanlar filtreleniyor..."
                  : `${properties.length} ilan bulundu.`}
              </span>
            </div>

            {/* İçerik / Kartlar / Yüklenme Durumu */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-novis-bronze/20 shadow-sm">
                <p className="text-novis-brown">İlanlar yükleniyor...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-8 rounded-2xl text-center text-red-600 border border-red-200">
                {error}
              </div>
            ) : properties.length === 0 ? (
              /* Boş Durum (Empty State) */
              <div className="bg-white p-12 rounded-2xl border border-novis-bronze/20 shadow-sm text-center">
                <span className="text-4xl block mb-2">🔍</span>
                <h3 className="font-display text-lg font-bold text-novis-anthracite mb-1">
                  Aradığınız kriterlere uygun ilan bulunamadı.
                </h3>
                <p className="text-novis-brown text-sm mb-6">
                  Filtreleri değiştirerek veya sıfırlayarak tekrar
                  deneyebilirsiniz.
                </p>
                <Button onClick={handleReset} variant="secondary">
                  Filtreleri Sıfırla
                </Button>
              </div>
            ) : (
              /* İlan Grid Listesi */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Properties;
