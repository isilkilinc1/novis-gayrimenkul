import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- YENİ İTHALAT
import { getProperties, deleteProperty } from "../../services/propertyService";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

function Properties() {
  const navigate = useNavigate(); // <-- YENİ HOOK
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa ilk açıldığında verileri çekiyoruz
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
        setError(null);
      } catch (err) {
        console.error("İlanlar yüklenirken hata:", err);
        setError("İlanlar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Silme fonksiyonu
  const handleDelete = async (id, title) => {
    if (
      window.confirm(
        `"${title}" başlıklı ilanı silmek istediğinize emin misiniz?`,
      )
    ) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter((prop) => prop.id !== id));
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("İlan silinirken bir hata oluştu.");
      }
    }
  };

  return (
    <Container>
      {/* Üst Başlık ve Buton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-novis-anthracite">
            İlan Yönetimi
          </h1>
          <p className="mt-2 text-novis-brown">
            NOVIS Gayrimenkul ilanlarını görüntüleyin ve yönetin.
          </p>
        </div>
        <div>
          {/* YENİ: Butona tıklayınca form sayfasına yönlendiriyoruz */}
          <Button
            variant="primary"
            onClick={() => navigate("/admin/ilanlar/yeni")}
          >
            + Yeni İlan
          </Button>
        </div>
      </div>

      {/* İlan Sayısı */}
      {!loading && !error && (
        <div className="mt-6 text-sm font-medium text-novis-brown">
          Toplam{" "}
          <span className="font-bold text-novis-anthracite">
            {properties.length}
          </span>{" "}
          ilan bulundu
        </div>
      )}

      {/* İçerik Alanı (Loading, Error, Empty veya Tablo) */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 text-novis-brown">
            İlanlar yükleniyor...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-12 text-center border border-red-200 text-red-600">
            <p>{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center border border-novis-bronze/20 text-novis-brown">
            Henüz ilan bulunmuyor.
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-sm border border-novis-bronze/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-novis-cream/50 border-b border-gray-200 text-xs uppercase text-novis-brown">
                  <tr>
                    <th className="py-4 px-6">Fotoğraf</th>
                    <th className="py-4 px-6">Başlık</th>
                    <th className="py-4 px-6">Tür</th>
                    <th className="py-4 px-6">Fiyat</th>
                    <th className="py-4 px-6">Konum</th>
                    <th className="py-4 px-6">Durum</th>
                    <th className="py-4 px-6 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((property) => (
                    <tr
                      key={property.id}
                      className="hover:bg-gray-50/50 transition"
                    >
                      {/* Fotoğraf Placeholder */}
                      <td className="py-4 px-6">
                        <div className="h-12 w-16 rounded-lg bg-novis-cream flex items-center justify-center text-lg border border-novis-bronze/20">
                          🏠
                        </div>
                      </td>

                      {/* Başlık */}
                      <td className="py-4 px-6 font-medium text-novis-anthracite max-w-xs truncate">
                        {property.title}
                      </td>

                      {/* Tür (Satılık / Kiralık) */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-novis-anthracite">
                          {property.listing_type === "SALE"
                            ? "Satılık"
                            : "Kiralık"}
                        </span>
                      </td>

                      {/* Fiyat */}
                      <td className="py-4 px-6 font-semibold text-novis-anthracite">
                        {Number(property.price).toLocaleString("tr-TR")} TL
                      </td>

                      {/* Konum */}
                      <td className="py-4 px-6">
                        <div className="text-novis-anthracite font-medium">
                          {property.city} / {property.district}
                        </div>
                        {property.neighborhood && (
                          <div className="text-xs text-gray-400">
                            {property.neighborhood}
                          </div>
                        )}
                      </td>

                      {/* Durum */}
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            property.status === "ACTIVE" ? "success" : "default"
                          }
                        >
                          {property.status === "ACTIVE"
                            ? "Aktif"
                            : property.status}
                        </Badge>
                      </td>

                      {/* İşlemler */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() =>
                            handleDelete(property.id, property.title)
                          }
                          className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

export default Properties;
