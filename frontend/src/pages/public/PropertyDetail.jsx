import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPropertyById,
  getPropertyImages,
} from "../../services/propertyService";
import { getSiteSettings } from "../../services/siteSettingsService";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import PropertyMap from "../../components/PropertyMap"; // 🗺️ Harita bileşeni
import ContactForm from "../../components/ContactForm"; // 📩 İletişim Formu bileşeni

function PropertyDetail() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [images, setImages] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sayfa açıldığında URL'deki id ile ilanı ve fotoğraflarını çekiyoruz
  const fetchPropertyData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPropertyById(id);
      setProperty(data);

      const imageListData = await getPropertyImages(id);
      setImages(imageListData);
    } catch (err) {
      console.error("İlan detayları veya fotoğraflar yüklenirken hata:", err);
      setError("İlan bulunamadı veya yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPropertyData();
  }, [fetchPropertyData]);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const data = await getSiteSettings();
        setSiteSettings(data);
      } catch (err) {
        console.error("Site ayarları yüklenirken hata:", err);
      }
    };

    fetchSiteSettings();
  }, []);

  // 1. Yükleniyor Durumu
  if (loading) {
    return (
      <section className="py-20">
        <Container>
          <div className="text-center text-novis-brown py-12">
            İlan yükleniyor...
          </div>
        </Container>
      </section>
    );
  }

  // 2. Hata veya Bulunamadı Durumu
  if (error || !property) {
    return (
      <section className="py-20">
        <Container>
          <div className="rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 shadow-sm max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-novis-anthracite mb-2">
              Eyvah, bir sorun oluştu!
            </h2>
            <p className="text-novis-brown mb-6">
              {error || "Aradığınız ilan bulunamadı."}
            </p>
            <Link to="/ilanlar">
              <Button>İlanlara Geri Dön</Button>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  // Etiket dönüşümleri için yardımcı sözlükler
  const propertyTypeLabels = {
    HOUSE: "Konut",
    LAND: "Arsa",
    COMMERCIAL: "İşyeri",
  };

  const listingTypeLabels = {
    SALE: "Satılık",
    RENT: "Kiralık",
  };

  // Aktif gösterilecek ana fotoğraf URL'i (yoksa yedek placeholder)
  const currentImage =
    images.length > 0
      ? `http://localhost:5000${images[activeImageIndex].image_url}`
      : "/images/property-placeholder.jpg";

  return (
    <section className="py-12 sm:py-16 bg-gray-50 min-h-screen">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Üst Bilgi / Başlık ve Fiyat Alanı */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-novis-bronze/20 shadow-sm">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>
                {listingTypeLabels[property.listing_type] ||
                  property.listing_type}
              </Badge>
              <Badge variant="dark">
                {propertyTypeLabels[property.property_type] ||
                  property.property_type}
              </Badge>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold text-novis-anthracite">
              {property.title}
            </h1>

            <p className="mt-2 text-sm text-novis-brown flex items-center gap-1">
              📍 {property.district} / {property.city}{" "}
              {property.neighborhood ? `• ${property.neighborhood} Mah.` : ""}
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs text-novis-brown uppercase tracking-wider block">
                  Fiyat
                </span>
                <span className="text-3xl font-bold text-novis-gold">
                  {Number(property.price).toLocaleString("tr-TR")} TL
                </span>
              </div>
            </div>
          </div>

          {/* 📸 FOTOĞRAF GALERİSİ ALANI */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-novis-bronze/20 shadow-sm space-y-4">
            {/* Büyük Ana Fotoğraf / Lightbox Tetikleyicisi */}
            <div
              className="relative h-72 sm:h-96 rounded-xl overflow-hidden bg-novis-bronze/10 border border-novis-bronze/20 cursor-pointer group"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={currentImage}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-black/70 text-white text-xs px-4 py-2 rounded-lg font-medium backdrop-blur-xs shadow-sm">
                  🔍 Büyük Boyutta Görüntüle
                </span>
              </div>
            </div>

            {/* Küçük Galeri Küçük Resimleri (Thumbnails) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === index
                        ? "border-novis-gold shadow-sm scale-102"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`http://localhost:5000${img.image_url}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gayrimenkul Türüne Göre Dinamik Özellikler Alanı */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-novis-bronze/20 shadow-sm">
            <h2 className="font-display text-xl font-bold text-novis-anthracite mb-6">
              Özellikler
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              {property.square_meters && (
                <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                  <span className="text-novis-brown block mb-1">
                    Alan (Net/Brüt)
                  </span>
                  <span className="font-bold text-novis-anthracite text-base">
                    {property.square_meters} m²
                  </span>
                </div>
              )}

              {property.property_type === "HOUSE" && (
                <>
                  {property.rooms && (
                    <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                      <span className="text-novis-brown block mb-1">
                        Oda Sayısı
                      </span>
                      <span className="font-bold text-novis-anthracite text-base">
                        {property.rooms}
                      </span>
                    </div>
                  )}
                  {property.floor !== null && property.floor !== undefined && (
                    <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                      <span className="text-novis-brown block mb-1">
                        Bulunduğu Kat
                      </span>
                      <span className="font-bold text-novis-anthracite text-base">
                        {property.floor}. Kat
                      </span>
                    </div>
                  )}
                  {property.building_age !== null &&
                    property.building_age !== undefined && (
                      <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                        <span className="text-novis-brown block mb-1">
                          Bina Yaşı
                        </span>
                        <span className="font-bold text-novis-anthracite text-base">
                          {property.building_age} Yaşında
                        </span>
                      </div>
                    )}
                  {property.heating_type && (
                    <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                      <span className="text-novis-brown block mb-1">
                        Isıtma Tipi
                      </span>
                      <span className="font-bold text-novis-anthracite text-base">
                        {property.heating_type}
                      </span>
                    </div>
                  )}
                  <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                    <span className="text-novis-brown block mb-1">Balkon</span>
                    <span className="font-bold text-novis-anthracite text-base">
                      {property.balcony ? "Var" : "Yok"}
                    </span>
                  </div>
                </>
              )}

              {property.property_type === "COMMERCIAL" && (
                <>
                  {property.floor !== null && property.floor !== undefined && (
                    <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                      <span className="text-novis-brown block mb-1">
                        Bulunduğu Kat
                      </span>
                      <span className="font-bold text-novis-anthracite text-base">
                        {property.floor}. Kat
                      </span>
                    </div>
                  )}
                  {property.building_age !== null &&
                    property.building_age !== undefined && (
                      <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                        <span className="text-novis-brown block mb-1">
                          Bina Yaşı
                        </span>
                        <span className="font-bold text-novis-anthracite text-base">
                          {property.building_age} Yaşında
                        </span>
                      </div>
                    )}
                  {property.heating_type && (
                    <div className="p-4 bg-novis-cream/30 rounded-xl border border-novis-bronze/10">
                      <span className="text-novis-brown block mb-1">
                        Isıtma Tipi
                      </span>
                      <span className="font-bold text-novis-anthracite text-base">
                        {property.heating_type}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Açıklama Alanı */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-novis-bronze/20 shadow-sm">
            <h2 className="font-display text-xl font-bold text-novis-anthracite mb-4">
              İlan Açıklaması
            </h2>
            <p className="text-novis-brown leading-relaxed whitespace-pre-line text-sm sm:text-base">
              {property.description}
            </p>
          </div>

          {/* 📍 HARİTA BÖLÜMÜ */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-novis-bronze/20 shadow-sm">
            <h3 className="font-display text-xl font-bold text-novis-anthracite mb-2 flex items-center gap-2">
              <span>📍 Konum</span>
            </h3>
            <p className="text-sm text-novis-brown mb-4">
              {property.district} / {property.city}{" "}
              {property.neighborhood ? `(${property.neighborhood} Mah.)` : ""}
            </p>
            <PropertyMap
              latitude={property.latitude}
              longitude={property.longitude}
              title={property.title}
              address={`${property.district} / ${property.city}`}
            />
          </div>

          {/* 📞 İLETİŞİM AKSİYON BUTONLARI & FORM */}
          <div className="grid grid-cols-1 gap-8">
            {/* Direkt Hızlı İletişim Butonları */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-novis-bronze/20 shadow-sm">
              <h3 className="font-display text-xl font-bold text-novis-anthracite mb-2">
                Hızlı İletişim
              </h3>
              <p className="text-sm text-novis-brown mb-6">
                Bu ilanla ilgileniyorsanız hemen aşağıdaki kanallardan bize
                ulaşabilirsiniz.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href={`tel:${(siteSettings?.phone || "0535 766 58 58").replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-4 rounded-xl font-semibold transition shadow-xs text-sm"
                >
                  <span>📞</span> Ara
                </a>

                <a
                  href={`https://wa.me/${(siteSettings?.phone || "0535 766 58 58").replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Merhaba, NOVIS Gayrimenkul sitesindeki "${property.title}" ilanı hakkında bilgi almak istiyorum.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3.5 px-4 rounded-xl font-semibold transition shadow-xs text-sm"
                >
                  <span>💬</span> WhatsApp
                </a>

                <a
                  href={`mailto:${siteSettings?.email || "mehmetdmn_@hotmail.com"}?subject=${encodeURIComponent(
                    `${property.title} İlanı Hakkında Bilgi`,
                  )}&body=${encodeURIComponent(
                    `Merhaba,\n\nWeb sitenizdeki "${property.title}" (ID: ${property.id}) ilanı hakkında detaylı bilgi almak istiyorum.\n\nİyi çalışmalar.`,
                  )}`}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold transition shadow-xs text-sm"
                >
                  <span>✉️</span> E-posta
                </a>
              </div>
            </div>

            {/* 📩 İlana Özel İletişim Formu Entegrasyonu */}
            <ContactForm
              propertyId={property.id}
              propertyTitle={property.title}
            />
          </div>
        </div>

        {/* 🔍 LIGHTBOX (BÜYÜK FOTOĞRAF MODALI) */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white text-xl bg-white/10 hover:bg-white/25 w-10 h-10 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
              <img
                src={currentImage}
                alt=""
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 text-white bg-black/60 hover:bg-black p-3 rounded-full transition shadow-md"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 text-white bg-black/60 hover:bg-black p-3 rounded-full transition shadow-md"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

export default PropertyDetail;
