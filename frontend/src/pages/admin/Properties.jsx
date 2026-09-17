import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminProperties,
  deleteProperty,
  updatePropertyStatus,
} from "../../services/propertyService";
import { getCustomers } from "../../services/customerService"; // Müşteri seçimi için
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { getFullImageUrl } from "../../utils/imageUrl";

const getPropertyStatusLabel = (status) => {
  const labels = {
    ACTIVE: "Aktif",
    INACTIVE: "Yayından Kaldırıldı",
    SOLD: "Satıldı",
    RENTED: "Kiralandı",
  };
  return labels[status] || status;
};

const getPropertyStatusVariant = (status) => {
  const variants = {
    ACTIVE: "success",
    INACTIVE: "dark",
    SOLD: "danger",
    RENTED: "bronze",
  };
  return variants[status] || "default";
};

const getPropertyTypeBadgeClass = (type) => {
  switch (type) {
    case "HOUSE":
      return "bg-novis-brown/15 text-novis-brown border-novis-brown/30";
    case "COMMERCIAL":
      return "bg-novis-gold/20 text-amber-900 border-novis-gold/40";
    case "LAND":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getPropertyPlaceholder = (type) => {
  switch (type) {
    case "LAND":
      return "/images/land-placeholder.jpg";
    case "COMMERCIAL":
      return "/images/commercial-placeholder.jpg";
    case "HOUSE":
    default:
      return "/images/property-placeholder.jpg";
  }
};

function Properties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtreleme ve Sıralama State'leri
  const [listingFilter, setListingFilter] = useState("ALL"); // ALL, SALE, RENT, SOLD, RENTED
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, HOUSE, LAND, COMMERCIAL
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, title-asc, price-asc, price-desc

  // Satış / Kiralama modal state'i
  const [selectedPropForTransaction, setSelectedPropForTransaction] =
    useState(null);
  const [pendingStatus, setPendingStatus] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [transactionNotes, setTransactionNotes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propData, custData] = await Promise.all([
          getAdminProperties(),
          getCustomers().catch(() => []),
        ]);
        setProperties(propData);
        setCustomers(custData);
        setError(null);
      } catch (err) {
        console.error("Veriler yüklenirken hata:", err);
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Durum değiştirme tetikleyicisi
  const handleStatusDropdownChange = (property, newStatus) => {
    if (["SOLD", "RENTED"].includes(newStatus)) {
      // Müşteri seçimi gerektirdiği için modal açıyoruz
      setSelectedPropForTransaction(property);
      setPendingStatus(newStatus);
      setSelectedCustomerId("");
      setTransactionNotes("");
    } else {
      executeStatusChange(property.id, newStatus, null, null);
    }
  };

  const executeStatusChange = async (
    propertyId,
    status,
    customerId,
    notes,
    finalPrice = null,
    transactionDate = null,
  ) => {
    try {
      const payload = {
        customerId,
        notes,
        finalPrice,
        transactionDate,
      };
      const response = await updatePropertyStatus(propertyId, status, payload);
      setProperties(
        properties.map((prop) =>
          prop.id === propertyId
            ? {
                ...prop,
                status: response.property ? response.property.status : status,
              }
            : prop,
        ),
      );
      setSelectedPropForTransaction(null);
    } catch (err) {
      console.error("Durum güncelleme hatası:", err);
      alert("İlan durumu güncellenirken bir hata oluştu.");
    }
  };

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

  // --- FİLTRELEME VE SIRALAMA MANTIĞI ---
  const filteredProperties = properties
    .filter((prop) => {
      if (listingFilter === "SALE") {
        if (prop.listing_type !== "SALE" || prop.status === "SOLD" || prop.status === "RENTED") return false;
      } else if (listingFilter === "RENT") {
        if (prop.listing_type !== "RENT" || prop.status === "SOLD" || prop.status === "RENTED") return false;
      } else if (listingFilter === "SOLD") {
        if (prop.status !== "SOLD") return false;
      } else if (listingFilter === "RENTED") {
        if (prop.status !== "RENTED") return false;
      }

      if (typeFilter !== "ALL" && prop.property_type !== typeFilter)
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === "date-asc") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title, "tr");
      }
      if (sortBy === "price-asc") {
        return Number(a.price) - Number(b.price);
      }
      if (sortBy === "price-desc") {
        return Number(b.price) - Number(a.price);
      }
      return 0;
    });

  return (
    <Container>
      {/* Üst Başlık ve Buton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-novis-anthracite">
            İlan Yönetimi
          </h1>
          <p className="mt-2 text-novis-brown">
            NOVIS Gayrimenkul ilanlarını görüntüleyin, filtreleyin ve yönetin.
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            onClick={() => navigate("/admin/ilanlar/yeni")}
          >
            + Yeni İlan
          </Button>
        </div>
      </div>

      {/* FİLTRELEME VE SIRALAMA ÇUBUĞU */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-novis-bronze/20 shadow-sm">
        {/* 1. İlan Tipi Filtresi (Hepsi / Satılık / Kiralık / Satıldı / Kiralandı) */}
        <div>
          <label className="block text-xs font-semibold text-novis-brown uppercase mb-1">
            İlan Tipi
          </label>
          <select
            value={listingFilter}
            onChange={(e) => setListingFilter(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-novis-anthracite focus:outline-none focus:ring-1 focus:ring-novis-bronze"
          >
            <option value="ALL">Tümü</option>
            <option value="SALE">Satılık</option>
            <option value="RENT">Kiralık</option>
            <option value="SOLD">Satıldı</option>
            <option value="RENTED">Kiralandı</option>
          </select>
        </div>

        {/* 2. Kategori Filtresi (Hepsi / Konut / Arsa / İşyeri) */}
        <div>
          <label className="block text-xs font-semibold text-novis-brown uppercase mb-1">
            Kategori
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-novis-anthracite focus:outline-none focus:ring-1 focus:ring-novis-bronze"
          >
            <option value="ALL">Tüm Kategoriler</option>
            <option value="HOUSE">Konut</option>
            <option value="LAND">Arsa</option>
            <option value="COMMERCIAL">İşyeri</option>
          </select>
        </div>

        {/* 3. Sıralama (Tarih, Alfabetik, Fiyat) */}
        <div>
          <label className="block text-xs font-semibold text-novis-brown uppercase mb-1">
            Sıralama
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-novis-anthracite focus:outline-none focus:ring-1 focus:ring-novis-bronze"
          >
            <option value="date-desc">Yeniden Eskiye (Tarih)</option>
            <option value="date-asc">Eskiden Yeniye (Tarih)</option>
            <option value="title-asc">Alfabetik (A-Z)</option>
            <option value="price-asc">Fiyata Göre (Artan)</option>
            <option value="price-desc">Fiyata Göre (Azalan)</option>
          </select>
        </div>
      </div>

      {/* İlan Sayısı Bilgisi */}
      {!loading && !error && (
        <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium text-novis-brown">
          Filtrelenen sonuç:{" "}
          <span className="font-bold text-novis-anthracite">
            {filteredProperties.length}
          </span>{" "}
          ilan gösteriliyor
        </div>
      )}

      {/* Tablo ve Liste Alanı */}
      <div className="mt-4">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 sm:p-12 text-center border border-novis-bronze/20 text-novis-brown text-sm">
            İlanlar yükleniyor...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-8 sm:p-12 text-center border border-red-200 text-red-600 text-sm">
            <p>{error}</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 sm:p-12 text-center border border-novis-bronze/20 text-novis-brown text-sm">
            Kriterlere uygun ilan bulunamadı.
          </div>
        ) : (
          <>
            {/* MOBİL İLAN LİSTESİ (md altı ekranlar) */}
            <div className="md:hidden space-y-3.5">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl border border-novis-bronze/20 p-4 shadow-xs space-y-3"
                >
                  <div className="flex gap-3 items-start">
                    <div className="h-16 w-20 rounded-xl bg-novis-cream shrink-0 border border-novis-bronze/20 overflow-hidden shadow-xs">
                      <img
                        src={
                          property.cover_image
                            ? getFullImageUrl(property.cover_image)
                            : getPropertyPlaceholder(property.property_type)
                        }
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-novis-anthracite text-sm line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="mt-1 font-bold text-novis-gold text-base">
                        {Number(property.price).toLocaleString("tr-TR")} TL
                      </p>
                      <p className="text-xs text-novis-brown mt-0.5">
                        📍 {property.city} / {property.district}
                      </p>
                    </div>
                  </div>

                  {/* Etiketler ve Durum */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-novis-anthracite">
                        {property.listing_type === "SALE" ? "Satılık" : "Kiralık"}
                      </span>
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${getPropertyTypeBadgeClass(property.property_type)}`}
                      >
                        {property.property_type === "HOUSE" && "Konut"}
                        {property.property_type === "LAND" && "Arsa"}
                        {property.property_type === "COMMERCIAL" && "İşyeri"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={getPropertyStatusVariant(property.status)}>
                        {getPropertyStatusLabel(property.status)}
                      </Badge>
                      <select
                        value={property.status}
                        onChange={(e) =>
                          handleStatusDropdownChange(property, e.target.value)
                        }
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white text-novis-anthracite focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                      >
                        <option value="ACTIVE">Aktif</option>
                        <option value="INACTIVE">Yayından Kaldır</option>
                        <option value="SOLD">Satıldı</option>
                        <option value="RENTED">Kiralandı</option>
                      </select>
                    </div>
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/ilanlar/${property.id}/duzenle`)
                      }
                      className="w-full text-center text-novis-anthracite font-semibold text-xs bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      ✏️ Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(property.id, property.title)
                      }
                      className="w-full text-center text-red-600 font-semibold text-xs bg-red-50 hover:bg-red-100 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* MASAÜSTÜ TABLO (md ve üzeri ekranlar) */}
            <div className="hidden md:block rounded-2xl bg-white shadow-sm border border-novis-bronze/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-novis-cream/50 border-b border-gray-200 text-xs uppercase text-novis-brown">
                    <tr>
                      <th className="py-4 px-6">Fotoğraf</th>
                      <th className="py-4 px-6">Başlık</th>
                      <th className="py-4 px-6">Tür</th>
                      <th className="py-4 px-6">Kategori</th>
                      <th className="py-4 px-6">Fiyat</th>
                      <th className="py-4 px-6">Konum</th>
                      <th className="py-4 px-6">Durum</th>
                      <th className="py-4 px-6 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProperties.map((property) => (
                      <tr
                        key={property.id}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="py-4 px-6">
                          <div className="h-12 w-16 rounded-lg bg-novis-cream flex items-center justify-center text-lg border border-novis-bronze/20 overflow-hidden shadow-xs">
                            <img
                              src={
                                property.cover_image
                                  ? getFullImageUrl(property.cover_image)
                                  : getPropertyPlaceholder(property.property_type)
                              }
                              alt={property.title}
                              className="w-full h-full object-cover select-none"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-novis-anthracite max-w-xs truncate">
                          {property.title}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-medium text-novis-anthracite">
                            {property.listing_type === "SALE"
                              ? "Satılık"
                              : "Kiralık"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${getPropertyTypeBadgeClass(property.property_type)}`}
                          >
                            {property.property_type === "HOUSE" && "Konut"}
                            {property.property_type === "LAND" && "Arsa"}
                            {property.property_type === "COMMERCIAL" && "İşyeri"}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-novis-anthracite">
                          {Number(property.price).toLocaleString("tr-TR")} TL
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-novis-anthracite font-medium">
                            {property.city} / {property.district}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5 items-start">
                            <Badge
                              variant={getPropertyStatusVariant(property.status)}
                            >
                              {getPropertyStatusLabel(property.status)}
                            </Badge>
                            <select
                              value={property.status}
                              onChange={(e) =>
                                handleStatusDropdownChange(
                                  property,
                                  e.target.value,
                                )
                              }
                              className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white text-novis-anthracite focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                            >
                              <option value="ACTIVE">Aktif</option>
                              <option value="INACTIVE">Yayından Kaldır</option>
                              <option value="SOLD">Satıldı</option>
                              <option value="RENTED">Kiralandı</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/ilanlar/${property.id}/duzenle`)
                            }
                            className="text-novis-anthracite hover:text-black font-medium text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(property.id, property.title)
                            }
                            className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
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
          </>
        )}
      </div>

      {/* SATIŞ / KİRALAMA LOG MODALI */}
      {selectedPropForTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-novis-bronze/20">
            <h3 className="text-xl font-bold text-novis-anthracite">
              {pendingStatus === "SOLD"
                ? "Mülk Satış Detayları"
                : "Mülk Kiralama Detayları"}
            </h3>
            <p className="text-xs text-novis-brown mt-1">
              Bu mülkü hangi müşteriye sattığınızı/kiraladığınızı ve tarihi
              kaydetmek için lütfen müşteri seçin.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-novis-anthracite uppercase mb-1">
                  Müşteri Seçin
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-novis-anthracite focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                >
                  <option value="">-- Müşteri Seçin --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.full_name || "İsimsiz müşteri"} ({c.phone || c.email || "İletişim bilgisi yok"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-novis-anthracite uppercase mb-1">
                  İşlem Notları (Opsiyonel)
                </label>
                <textarea
                  value={transactionNotes}
                  onChange={(e) => setTransactionNotes(e.target.value)}
                  placeholder="Örn: Kapora alındı, tapu devri tamamlandı..."
                  className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-novis-anthracite focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedPropForTransaction(null)}
                >
                  İptal
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    executeStatusChange(
                      selectedPropForTransaction.id,
                      pendingStatus,
                      selectedCustomerId || null,
                      transactionNotes,
                    )
                  }
                >
                  Kaydet ve Durumu Güncelle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Properties;
