import { useEffect, useState } from "react";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import { getProperties } from "../../services/propertyService";

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        console.error("İlanlar yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <section className="py-24">
      <Container>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
          NOVIS GAYRİMENKUL
        </p>

        <h1 className="max-w-3xl font-display text-5xl font-bold text-novis-anthracite md:text-6xl">
          Hayalinizdeki yaşam alanını keşfedin.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-novis-brown">
          Alım, satım, kiralama ve inşaat hizmetlerinde profesyonel gayrimenkul
          çözümleri.
        </p>

        <div className="mt-8 flex gap-4">
          <Button>İlanları İncele</Button>
          <Button variant="secondary">Bize Ulaşın</Button>
        </div>

        {/* --- VERİTABANINDAN GELEN İLANLARI LİSTELEME ALANI --- */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-novis-anthracite mb-6">
            Öne Çıkan İlanlar (Veritabanından)
          </h2>

          {loading ? (
            <p className="text-novis-brown">İlanlar yükleniyor...</p>
          ) : properties.length === 0 ? (
            <p className="text-novis-brown">Henüz eklenmiş ilan bulunmuyor.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className="inline-block px-3 py-1 mb-3 text-xs font-semibold uppercase tracking-wider bg-novis-bronze/10 text-novis-bronze rounded-full">
                    {property.listing_type === "SALE" ? "Satılık" : "Kiralık"}
                  </span>

                  <h3 className="font-display text-xl font-bold text-novis-anthracite mb-2">
                    {property.title}
                  </h3>

                  <p className="text-novis-brown text-sm mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-lg font-bold text-novis-anthracite">
                      {Number(property.price).toLocaleString("tr-TR")} TL
                    </span>
                    <span className="text-sm text-novis-brown">
                      {property.city} / {property.district}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export default Home;
