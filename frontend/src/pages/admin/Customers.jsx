import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../services/customerService";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // MODAL KONTROLLERİ
  // =========================================================
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // =========================================================
  // FORM STATE
  // =========================================================
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    demand: "",
    status: "NEW",
    notes: "",
  });

  // =========================================================
  // MÜŞTERİLERİ GETİR
  // =========================================================
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers();

      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Müşteriler yüklenemedi:", err);
      setError("Müşteriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, [fetchCustomers]);

  // =========================================================
  // FORM DEĞİŞİKLİKLERİ
  // =========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // YENİ MÜŞTERİ FORMUNU SIFIRLA
  // =========================================================
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      budget: "",
      demand: "",
      status: "NEW",
      notes: "",
    });
  };

  // =========================================================
  // YENİ MÜŞTERİ KAYDET
  // =========================================================
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      await createCustomer({
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
      });

      setShowAddModal(false);
      resetForm();

      await fetchCustomers();
    } catch (err) {
      console.error("Müşteri eklenemedi:", err);

      alert(
        err?.response?.data?.message || "Müşteri eklenirken bir hata oluştu.",
      );
    }
  };

  // =========================================================
  // MÜŞTERİ DÜZENLEME MODALINI AÇ
  // =========================================================
  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      budget: customer.budget || "",
      demand: customer.demand || "",
      status: customer.status || "NEW",
      notes: customer.notes || "",
    });

    setShowEditModal(true);
  };

  // =========================================================
  // MÜŞTERİ GÜNCELLE
  // =========================================================
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    try {
      await updateCustomer(selectedCustomer.id, {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
      });

      setShowEditModal(false);
      setSelectedCustomer(null);
      resetForm();

      await fetchCustomers();
    } catch (err) {
      console.error("Müşteri güncelleme hatası:", err);

      alert(
        err?.response?.data?.message ||
          "Müşteri güncellenirken bir hata oluştu.",
      );
    }
  };

  // =========================================================
  // MÜŞTERİ SİL
  // =========================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await deleteCustomer(id);

      await fetchCustomers();
    } catch (err) {
      console.error("Silme hatası:", err);

      alert(
        err?.response?.data?.message || "Müşteri silinirken bir hata oluştu.",
      );
    }
  };

  // =========================================================
  // EXCEL'E AKTAR (EXPORT)
  // =========================================================
  const exportToExcel = () => {
    const statusLabels = {
      NEW: "Yeni Müşteri",
      CONTACTED: "İletişim Kuruldu",
      SEARCHING: "Aktif Arıyor",
      VIEWING: "İlan Geziyor",
      COMPLETED: "Tamamlandı",
      CANCELLED: "İptal",
    };

    // Filtrelenmiş veya tüm listeyi Excel'e aktarabiliriz (Burada tüm müşterileri baz alıyoruz)
    const excelData = customers.map((customer) => ({
      "Ad Soyad": customer.name,
      Telefon: customer.phone,
      "E-posta": customer.email,
      Bütçe: customer.budget,
      Talep: customer.demand,
      Durum: statusLabels[customer.status] || customer.status,
      Not: customer.notes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Müşteriler");

    XLSX.writeFile(workbook, "novis-musteriler.xlsx");
  };

  // =========================================================
  // DURUM ETİKETİ
  // =========================================================
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
            🔵 Görüşüldü
          </span>
        );

      case "SEARCHING":
        return (
          <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🟣 Arıyor
          </span>
        );

      case "VIEWING":
        return (
          <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🟠 Geziliyor
          </span>
        );

      case "COMPLETED":
        return (
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🟢 Tamamlandı
          </span>
        );

      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            🔴 İptal
          </span>
        );

      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            {status || "-"}
          </span>
        );
    }
  };

  // =========================================================
  // DURUMUN TÜRKÇE KARŞILIĞI
  // ARAMA İÇİN KULLANILIYOR
  // =========================================================
  const getStatusText = (status) => {
    switch (status) {
      case "NEW":
        return "Yeni Yeni Müşteri";

      case "CONTACTED":
        return "Görüşüldü İletişim Kuruldu";

      case "SEARCHING":
        return "Arıyor Aktif Arıyor";

      case "VIEWING":
        return "Geziliyor İlan Geziyor";

      case "COMPLETED":
        return "Tamamlandı";

      case "CANCELLED":
        return "İptal";

      default:
        return status || "";
    }
  };

  // =========================================================
  // TÜRKÇE KARAKTERLERİ NORMALIZE ET
  // =========================================================
  const normalizeText = (value) => {
    return String(value || "")
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .trim();
  };

  // =========================================================
  // ARAMA
  // =========================================================
  const filteredCustomers = customers.filter((customer) => {
    const term = normalizeText(searchTerm);

    if (!term) {
      return true;
    }

    const name = normalizeText(customer.name);
    const phone = normalizeText(customer.phone);
    const email = normalizeText(customer.email);
    const budget = normalizeText(customer.budget);
    const demand = normalizeText(customer.demand);
    const status = normalizeText(customer.status);
    const statusText = normalizeText(getStatusText(customer.status));
    const notes = normalizeText(customer.notes);

    return (
      name.includes(term) ||
      phone.includes(term) ||
      email.includes(term) ||
      budget.includes(term) ||
      demand.includes(term) ||
      status.includes(term) ||
      statusText.includes(term) ||
      notes.includes(term)
    );
  });

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <Container>
      <div className="py-8 max-w-6xl mx-auto">
        {/* =====================================================
            BAŞLIK VE AKSİYON BUTONLARI
        ====================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-novis-anthracite">
              Müşteri Yönetimi (CRM)
            </h1>

            <p className="mt-1 text-sm text-novis-brown">
              Dayının potansiyel müşterilerini, bütçelerini ve taleplerini
              buradan takip edebilirsin.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={exportToExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition text-sm flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>📥</span> Excel'e Aktar
            </button>

            <Button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              + Yeni Müşteri Ekle
            </Button>
          </div>
        </div>

        {/* =====================================================
            ARAMA
        ====================================================== */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
              🔍
            </span>

            <input
              type="text"
              placeholder="Ad, soyad, e-posta, telefon, durum, talep veya not ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-novis-bronze/30 bg-white pl-11 pr-10 py-3 text-novis-anthracite placeholder-gray-400 focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm shadow-xs"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-700"
                aria-label="Aramayı temizle"
              >
                ✕
              </button>
            )}
          </div>

          {!loading && (
            <p className="mt-2 text-xs text-gray-500">
              {searchTerm
                ? `"${searchTerm}" için ${filteredCustomers.length} müşteri bulundu.`
                : `${customers.length} müşteri kayıtlı.`}
            </p>
          )}
        </div>

        {/* =====================================================
            HATA
        ====================================================== */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* =====================================================
            MÜŞTERİ TABLOSU
        ====================================================== */}
        <div className="bg-white rounded-2xl border border-novis-bronze/20 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Müşteriler yükleniyor...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              {searchTerm
                ? `"${searchTerm}" ile eşleşen müşteri bulunamadı.`
                : "Kayıtlı müşteri bulunamadı."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-novis-cream/40 border-b border-novis-bronze/10 text-xs font-bold text-novis-anthracite uppercase">
                    <th className="p-4">Ad Soyad</th>
                    <th className="p-4">Telefon</th>
                    <th className="p-4">Bütçe</th>
                    <th className="p-4">Talep</th>
                    <th className="p-4">Durum</th>
                    <th className="p-4">Not</th>
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-bold text-novis-anthracite">
                        <div>{customer.name}</div>

                        {customer.email && (
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-xs font-normal text-novis-brown hover:underline block mt-0.5"
                          >
                            ✉️ {customer.email}
                          </a>
                        )}
                      </td>

                      <td className="p-4 text-gray-600">
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone}`}
                            className="inline-flex items-center gap-1 text-novis-anthracite font-medium hover:text-novis-bronze transition"
                          >
                            📞 {customer.phone}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-4 text-gray-600 font-medium whitespace-nowrap">
                        {customer.budget
                          ? `${Number(customer.budget).toLocaleString(
                              "tr-TR",
                            )} TL`
                          : "-"}
                      </td>

                      <td className="p-4 text-gray-600">
                        {customer.demand || "-"}
                      </td>

                      <td className="p-4">{getStatusBadge(customer.status)}</td>

                      <td className="p-4 text-gray-600 max-w-xs">
                        {customer.notes ? (
                          <span
                            className="block truncate"
                            title={customer.notes}
                          >
                            {customer.notes}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(customer)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition mr-2"
                        >
                          Düzenle
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =====================================================
            YENİ MÜŞTERİ EKLEME MODALI
        ====================================================== */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-novis-bronze/20 my-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-novis-anthracite">
                  Yeni Müşteri Ekle
                </h2>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <Input
                  label="Ad Soyad *"
                  name="name"
                  placeholder="Örn. Ahmet Yılmaz"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Telefon"
                    name="phone"
                    placeholder="0532..."
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <Input
                    label="E-posta"
                    name="email"
                    type="email"
                    placeholder="ahmet@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Bütçe (TL)"
                    name="budget"
                    type="number"
                    placeholder="3500000"
                    value={formData.budget}
                    onChange={handleChange}
                  />

                  <div>
                    <label className="block text-sm font-medium text-novis-anthracite mb-2">
                      Durum
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
                    >
                      <option value="NEW">Yeni Müşteri</option>
                      <option value="CONTACTED">İletişim Kuruldu</option>
                      <option value="SEARCHING">Aktif Arıyor</option>
                      <option value="VIEWING">İlan Geziyor</option>
                      <option value="COMPLETED">Tamamlandı</option>
                      <option value="CANCELLED">İptal</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Talep (Ne arıyor?)"
                  name="demand"
                  placeholder="Örn. 3+1 Daire, Meram civarı"
                  value={formData.demand}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-sm font-medium text-novis-anthracite mb-2">
                    Özel Notlar
                  </label>

                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Müşteri hakkında ek notlar..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite placeholder-gray-400 focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    İptal
                  </Button>

                  <Button type="submit">Müşteriyi Kaydet</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            MÜŞTERİ DÜZENLEME MODALI
        ====================================================== */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-novis-bronze/20 my-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-novis-anthracite">
                  Müşteri Düzenle
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <Input
                  label="Ad Soyad *"
                  name="name"
                  placeholder="Örn. Ahmet Yılmaz"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Telefon"
                    name="phone"
                    placeholder="0532..."
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <Input
                    label="E-posta"
                    name="email"
                    type="email"
                    placeholder="ahmet@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Bütçe (TL)"
                    name="budget"
                    type="number"
                    placeholder="3500000"
                    value={formData.budget}
                    onChange={handleChange}
                  />

                  <div>
                    <label className="block text-sm font-medium text-novis-anthracite mb-2">
                      Durum
                    </label>

                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
                    >
                      <option value="NEW">Yeni Müşteri</option>
                      <option value="CONTACTED">İletişim Kuruldu</option>
                      <option value="SEARCHING">Aktif Arıyor</option>
                      <option value="VIEWING">İlan Geziyor</option>
                      <option value="COMPLETED">Tamamlandı</option>
                      <option value="CANCELLED">İptal</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Talep (Ne arıyor?)"
                  name="demand"
                  placeholder="Örn. 3+1 Daire, Meram civarı"
                  value={formData.demand}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-sm font-medium text-novis-anthracite mb-2">
                    Özel Notlar
                  </label>

                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Müşteri hakkında ek notlar..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-novis-bronze/30 bg-white px-4 py-3 text-novis-anthracite placeholder-gray-400 focus:border-novis-bronze focus:outline-none focus:ring-1 focus:ring-novis-bronze transition text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedCustomer(null);
                    }}
                  >
                    İptal
                  </Button>

                  <Button type="submit">Güncellemeyi Kaydet</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
