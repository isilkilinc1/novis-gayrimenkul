import { useEffect, useState } from "react";
import Container from "../../components/ui/Container";
import PropertyCard from "../../components/PropertyCard";
import { getProperties } from "../../services/propertyService";

function Properties() {
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
    <section className="py-20 bg-gray-50 min-h-screen">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-novis-bronze">
          NOVIS GAYRİMENKUL
        </p>

        <h1 className="mt-3 font-display text-4xl font-bold text-novis-anthracite">
          Gayrimenkul İlanları
        </h1>

        <p className="mt-4 text-novis-brown">
          Satılık ve kiralık en güncel portföyümüzü keşfedin.
        </p>

        {loading ? (
          <div className="mt-12 rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 text-novis-brown">
            İlanlar yükleniyor...
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 text-novis-brown">
            Henüz eklenmiş ilan bulunmuyor.
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

export default Properties;
