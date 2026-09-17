import { useState, useEffect, useCallback } from "react";
import {
  getContactRequests,
  updateContactStatus,
  deleteContactRequest,
} from "../../services/contactService";
import Container from "../../components/ui/Container";
import PropertyDetailsModal from "../../components/PropertyDetailsModal";

export default function ContactRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContactRequests();
      setRequests(data);
    } catch (err) {
      console.error("Talepler yüklenemedi:", err);
      setError("İletişim talepleri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateContactStatus(id, newStatus);
      fetchRequests();
    } catch (err) {
      console.error("Durum güncellenemedi:", err);
      alert("Durum güncellenirken hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Bu iletişim talebini silmek istediğinize emin misiniz?")
    ) {
      try {
        await deleteContactRequest(id);
        fetchRequests();
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("Silinirken bir hata oluştu.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "NEW":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🟡 Yeni
          </span>
        );
      case "CONTACTED":
        return (
          <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🔵 İletişime Geçildi
          </span>
        );
      case "DISCUSSED":
        return (
          <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🟣 Görüşüldü
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🟢 Sonuçlandı
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            ⚫ Arşivlendi
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  const filteredRequests = requests.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(term) ||
      r.phone?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.message?.toLowerCase().includes(term) ||
      r.property_title?.toLowerCase().includes(term)
    );
  });

  return (
    <Container>
      <div className="py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-novis-anthracite">
              İletişim Talepleri
            </h1>
            <p className="mt-1 text-sm text-novis-brown">
              Siteden gelen potansiyel müşteri mesajlarını ve ilan taleplerini
              buradan yönetin.
            </p>
          </div>
        </div>

        {/* Arama Çubuğu */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Ad, telefon, e-posta veya mesaj ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-novis-bronze/30 bg-white pl-11 pr-4 py-3 text-novis-anthracite placeholder-gray-400 focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm shadow-xs"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Tablo ve Liste Alanı */}
        <div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-novis-bronze/20 p-8 text-center text-gray-500 text-sm">
              Yükleniyor...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-novis-bronze/20 p-8 text-center text-gray-500 text-sm">
              Henüz iletişim talebi bulunmuyor.
            </div>
          ) : (
            <>
              {/* MOBİL KART LİSTESİ (md altı ekranlar) */}
              <div className="md:hidden space-y-3.5">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-novis-bronze/20 p-4 shadow-xs space-y-3"
                  >
                    {/* Üst: İsim ve Tarih */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-novis-anthracite text-base">
                          {req.name}
                        </h3>
                        <div className="flex flex-col gap-0.5 mt-1 text-xs">
                          {req.phone && (
                            <a
                              href={`tel:${req.phone}`}
                              className="text-novis-anthracite font-medium hover:text-novis-bronze"
                            >
                              📞 {req.phone}
                            </a>
                          )}
                          {req.email && (
                            <a
                              href={`mailto:${req.email}`}
                              className="text-gray-500 hover:text-novis-anthracite break-all"
                            >
                              ✉️ {req.email}
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium shrink-0">
                        {new Date(req.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    {/* İlgilendiği İlan */}
                    {req.property_id ? (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedPropertyId(req.property_id)}
                          className="w-full inline-flex items-center gap-1.5 bg-novis-cream/60 hover:bg-novis-cream text-novis-anthracite px-2.5 py-1.5 rounded-lg border border-novis-bronze/20 transition text-left text-xs cursor-pointer"
                        >
                          <span>🏢</span>
                          <span className="font-semibold underline truncate">
                            #{req.property_id} - {req.property_title || "İlan Başlığı Yok"}
                          </span>
                        </button>
                      </div>
                    ) : req.property_title ? (
                      <div className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-200 text-xs">
                        🏢 {req.property_title}
                      </div>
                    ) : null}

                    {/* Mesaj */}
                    {req.message && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-novis-anthracite leading-relaxed">
                        <span className="font-semibold text-gray-500 block mb-1">Mesaj:</span>
                        {req.message}
                      </div>
                    )}

                    {/* Durum ve Silme Aksiyonu */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {getStatusBadge(req.status)}
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(req.id, e.target.value)
                          }
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white text-novis-anthracite focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                        >
                          <option value="NEW">🟡 Yeni</option>
                          <option value="CONTACTED">🔵 İletişime Geçildi</option>
                          <option value="DISCUSSED">🟣 Görüşüldü</option>
                          <option value="COMPLETED">🟢 Sonuçlandı</option>
                          <option value="ARCHIVED">⚫ Arşivlendi</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(req.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* MASAÜSTÜ TABLOSU (md ve üzeri ekranlar) */}
              <div className="hidden md:block bg-white rounded-2xl border border-novis-bronze/20 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-novis-cream/40 border-b border-novis-bronze/10 text-xs font-bold text-novis-anthracite uppercase tracking-wider">
                        <th className="p-4">Ad Soyad / İletişim</th>
                        <th className="p-4">İLGİLENDİĞİ İLAN</th>
                        <th className="p-4">Mesaj</th>
                        <th className="p-4">Durum</th>
                        <th className="p-4">Tarih</th>
                        <th className="p-4 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition">
                          <td className="p-4">
                            <div className="font-bold text-novis-anthracite">
                              {req.name}
                            </div>
                            {req.phone && (
                              <a
                                href={`tel:${req.phone}`}
                                className="text-xs text-novis-brown block hover:underline"
                              >
                                📞 {req.phone}
                              </a>
                            )}
                            {req.email && (
                              <a
                                href={`mailto:${req.email}`}
                                className="text-xs text-gray-500 block hover:underline"
                              >
                                ✉️ {req.email}
                              </a>
                            )}
                          </td>
                          <td className="p-4 text-xs font-medium text-novis-anthracite">
                            {req.property_id ? (
                              <button
                                type="button"
                                onClick={() => setSelectedPropertyId(req.property_id)}
                                className="inline-flex items-center gap-1.5 bg-novis-cream/60 hover:bg-novis-cream text-novis-anthracite hover:text-novis-gold px-2.5 py-1.5 rounded-lg border border-novis-bronze/20 transition group max-w-[220px] text-left cursor-pointer"
                                title="İlgili İlan Detaylarını Görüntüle"
                              >
                                <span>🏢</span>
                                <span className="font-semibold underline decoration-dotted group-hover:decoration-solid truncate">
                                  #{req.property_id} - {req.property_title || "İlan Başlığı Yok"}
                                </span>
                              </button>
                            ) : req.property_title ? (
                              <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-500 px-2 py-1 rounded border border-gray-200">
                                🏢 {req.property_title}
                              </span>
                            ) : (
                              <span className="text-gray-400">Genel İletişim</span>
                            )}
                          </td>
                          <td
                            className="p-4 text-gray-600 max-w-xs truncate"
                            title={req.message}
                          >
                            {req.message}
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              {getStatusBadge(req.status)}
                              <select
                                value={req.status}
                                onChange={(e) =>
                                  handleStatusChange(req.id, e.target.value)
                                }
                                className="block text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white focus:outline-none"
                              >
                                <option value="NEW">🟡 Yeni</option>
                                <option value="CONTACTED">
                                  🔵 İletişime Geçildi
                                </option>
                                <option value="DISCUSSED">🟣 Görüşüldü</option>
                                <option value="COMPLETED">🟢 Sonuçlandı</option>
                                <option value="ARCHIVED">⚫ Arşivlendi</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-gray-500">
                            {new Date(req.created_at).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition cursor-pointer"
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

        {/* İlan Detay Modalı */}
        {selectedPropertyId && (
          <PropertyDetailsModal
            propertyId={selectedPropertyId}
            onClose={() => setSelectedPropertyId(null)}
          />
        )}
      </div>
    </Container>
  );
}
