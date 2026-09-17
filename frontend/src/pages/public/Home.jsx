import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import PropertyCard from "../../components/PropertyCard";
import { getProperties } from "../../services/propertyService";

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data.data || []);
      } catch (error) {
        console.error("İlanlar yüklenirken hata oluştu:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div>
      {/* --- HERO BÖLÜMÜ (Ortalanmış Tasarım) --- */}
      <section className="relative min-h-150 lg:min-h-175 flex items-center justify-center overflow-hidden bg-novis-anthracite">
        {/* Arka Plan Görseli */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-building.jpg"
            alt="NOVIS Gayrimenkul Bina"
            className="w-full h-full object-cover object-center"
          />
          {/* Yazıların okunabilirliğini artırmak için koyu şeffaf katman (Overlay) */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Üstüne Oturan ve Ortalanmış İçerik */}
        <Container className="relative z-10 py-12 sm:py-20 text-center">
          <div className="max-w-3xl mx-auto pt-8 sm:pt-16">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-novis-gold">
              NOVIS GAYRİMENKUL
            </p>

            <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-medium uppercase tracking-widest text-novis-cream/80">
              Alım • Satım • Kiralama • İnşaat
            </p>

            <h1 className="mt-3 sm:mt-4 font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Hayalinizdeki <br />
              yaşam alanını bulun.
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg leading-6 sm:leading-8 text-gray-200 max-w-2xl mx-auto">
              Size ve ihtiyaçlarınıza uygun gayrimenkulü güvenilir ve
              profesyonel hizmet anlayışıyla keşfedin.
            </p>

            {/* Yönlendiren Butonlar (Ortalanmış) */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Link to="/ilanlar" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto justify-center">İlanları İncele</Button>
              </Link>

              <Link to="/iletisim" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto justify-center bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  Bize Ulaşın
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* --- ÖNE ÇIKAN İLANLAR BÖLÜMÜ --- */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <Container>
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-novis-anthracite">
                Öne Çıkan İlanlar
              </h2>
              <p className="mt-1 text-novis-brown text-xs sm:text-sm">
                En güncel portföyümüzden seçkin alternatifler.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 text-novis-brown">
              İlanlar yükleniyor...
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 text-novis-brown">
              Henüz eklenmiş ilan bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}

export default Home;
