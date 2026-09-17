import { useState, useEffect, useCallback } from "react";
import Container from "../../components/ui/Container";
import PropertyCard from "../../components/PropertyCard";
import Button from "../../components/ui/Button";
import { getProperties } from "../../services/propertyService";

function Properties() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Arama ve Filtre State'leri
  const [search, setSearch] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
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

  // Aktif filtre sayısı (kullanıcıya rozet olarak göstermek için)
  const activeFiltersCount = Object.entries(filters).filter(
    ([, val]) => val !== "" && val !== null && val !== undefined && val !== 0,
  ).length;

  // Backend'den filtrelenmiş, aranmış ve sayfalanmış ilanları çeken fonksiyon
  const fetchProperties = useCallback(
    async (currentSearch, currentFilters, currentPage) => {
      try {
        setLoading(true);
        setError("");

        const queryParams = {
          search:
            currentSearch && currentSearch.trim() !== ""
              ? currentSearch.trim()
              : undefined,
          page: currentPage,
          limit: 9,
          ...currentFilters,
        };

        const cleanParams = Object.fromEntries(
          Object.entries(queryParams).filter(
            ([, v]) => v !== "" && v !== null && v !== undefined && v !== 0,
          ),
        );

        const result = await getProperties(cleanParams);
        setProperties(result.data || result);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } catch (err) {
        console.error("Detaylı API Hatası:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            "İlanlar yüklenirken bir sorun oluştu.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Sayfa ilk yüklendiğinde ilanları çek
  // Sayfa ilk yüklendiğinde ilanları çek
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperties("", filters, 1);
  }, [fetchProperties, filters]);

  // Input değişikliklerini yöneten fonksiyon
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "propertyType" && value !== "HOUSE" ? { rooms: "" } : {}),
    }));
  };

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (newPage) => {
    fetchProperties(search, filters, newPage);
  };

  // "Filtrele" veya "Ara" butonuna basıldığında
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProperties(search, filters, 1);
    if (window.innerWidth < 1024) {
      setIsMobileFiltersOpen(false);
    }
  };

  // "Filtreleri Sıfırla" butonuna basıldığında
  const handleReset = () => {
    setSearch("");
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
    fetchProperties("", resetState, 1);
  };

  return (
    <section className="py-12 sm:py-20 bg-gray-50 min-h-screen">
      <Container>
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
          NOVIS GAYRİMENKUL
        </p>

        <h1 className="mt-2 sm:mt-3 font-display text-3xl sm:text-4xl font-bold text-novis-anthracite">
          Gayrimenkul İlanları
        </h1>

        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-novis-brown">
          Hayalinizdeki gayrimenkulü arayın, kriterlerinize göre filtreleyin.
        </p>

        {/* ARAMA ÇUBUĞU ÜST ALANI */}
        <div className="mt-6 sm:mt-8">
          <form onSubmit={handleFilterSubmit} className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 sm:pl-4 text-novis-brown">
                🔍
              </span>
              <input
                type="text"
                placeholder="İlan, konum, başlık veya özellik ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-2xl border border-novis-bronze/30 bg-white text-novis-anthracite shadow-xs focus:outline-none focus:border-novis-gold text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" className="px-4 sm:px-6 rounded-2xl text-xs sm:text-sm shrink-0">
              Ara
            </Button>
          </form>
        </div>

        {/* MOBİL FİLTRE AÇ/KAPAT BUTONU (lg altı ekranlar) */}
        <div className="mt-3 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white rounded-2xl border border-novis-bronze/30 shadow-xs text-novis-anthracite font-medium text-sm hover:border-novis-gold active:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <span className="font-semibold text-novis-anthracite">Filtrele</span>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-novis-gold text-white rounded-full">
                  {activeFiltersCount} Aktif
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-novis-brown font-medium">
              <span>{isMobileFiltersOpen ? "Paneli Kapat" : "Filtreleri Göster"}</span>
              <span className="text-xs">{isMobileFiltersOpen ? "▲" : "▼"}</span>
            </div>
          </button>
        </div>

        {/* Ana Düzen: Sol Taraf Filtre Paneli, Sağ Taraf İlan Listesi */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* SOL: FİLTRE PANELİ */}
          <div
            className={`lg:col-span-1 ${
              isMobileFiltersOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-novis-bronze/20 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold text-novis-anthracite">
                    Filtreler
                  </h2>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs bg-novis-gold/15 text-novis-bronze font-semibold px-2 py-0.5 rounded-full">
                      {activeFiltersCount} aktif
                    </span>
                  )}
                </div>

                {/* Mobilde sağ üstte Kapat butonu */}
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="lg:hidden text-xs text-novis-brown hover:text-novis-anthracite font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                >
                  Kapat ✕
                </button>
              </div>

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
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 bg-white text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
                  >
                    <option value="">Tüm Türler</option>
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
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 bg-white text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
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
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 bg-white text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
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
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
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
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
                    />
                    <input
                      type="number"
                      name="maxSquareMeters"
                      placeholder="Max m²"
                      value={filters.maxSquareMeters}
                      onChange={handleChange}
                      className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
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
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
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
                    className="w-full p-2.5 rounded-xl border border-novis-bronze/30 text-novis-anthracite focus:outline-none focus:border-novis-gold text-sm"
                  />
                </div>

                {/* Butonlar */}
                <div className="pt-2 flex flex-col gap-2">
                  <Button type="submit" className="w-full justify-center py-3 text-sm font-semibold">
                    Filtreleri Uygula
                  </Button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2.5 text-center text-xs text-novis-brown hover:text-novis-anthracite font-medium transition-colors cursor-pointer"
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SAĞ: İLAN LİSTESİ VE PAGINATION ALANI */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sonuç Sayısı Bildirimi */}
            <div className="bg-white px-6 py-4 rounded-2xl border border-novis-bronze/20 shadow-sm flex items-center justify-between">
              <span className="text-sm font-medium text-novis-anthracite">
                {loading
                  ? "İlanlar aranıyor..."
                  : `Toplam ${pagination.total ?? properties.length} ilan bulundu.`}
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
                  Aramanızla eşleşen ilan bulunamadı.
                </h3>
                <p className="text-novis-brown text-sm mb-6">
                  Arama kelimenizi veya filtre kriterlerinizi değiştirmeyi
                  deneyebilirsiniz.
                </p>
                <Button onClick={handleReset} variant="secondary">
                  Aramayı ve Filtreleri Sıfırla
                </Button>
              </div>
            ) : (
              <>
                {/* İlan Grid Listesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* PAGINATION (SAYFALAMA) BUTONLARI */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 sm:gap-2 pt-6 flex-wrap">
                    {/* Önceki Sayfa Butonu */}
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(pagination.page - 1, 1))
                      }
                      disabled={pagination.page === 1}
                      className="px-3 sm:px-4 py-2 rounded-xl border border-novis-bronze/30 text-xs sm:text-sm font-medium text-novis-anthracite disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      ‹ Önceki
                    </button>

                    {/* Sayfa Numaraları */}
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => {
                        const pageNum = index + 1;
                        const isActive = pageNum === pagination.page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                              isActive
                                ? "bg-novis-anthracite text-white shadow-sm"
                                : "border border-novis-bronze/30 text-novis-anthracite hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}

                    {/* Sonraki Sayfa Butonu */}
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.min(pagination.page + 1, pagination.totalPages),
                        )
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 sm:px-4 py-2 rounded-xl border border-novis-bronze/30 text-xs sm:text-sm font-medium text-novis-anthracite disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      Sonraki ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default Properties;
