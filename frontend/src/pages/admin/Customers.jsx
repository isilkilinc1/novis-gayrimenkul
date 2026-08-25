import { useState, useEffect } from "react";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
} from "../../services/customerService";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    budget: "",
    demand: "",
    status: "NEW",
    notes: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Müşteriler yüklenemedi:", err);
      setError("Müşteriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("Müşteriler yüklenemedi:", err);
        setError("Müşteriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCustomer({
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
      });
      setShowModal(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        budget: "",
        demand: "",
        status: "NEW",
        notes: "",
      });
      fetchCustomers();
    } catch (err) {
      console.error("Müşteri eklenemedi:", err);
      alert("Müşteri eklenirken hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteCustomer(id);
        fetchCustomers();
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
            {status}
          </span>
        );
    }
  };

  return (
    <Container>
      <div className="py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-novis-anthracite">
              Müşteri Yönetimi (CRM)
            </h1>
            <p className="mt-1 text-sm text-novis-brown">
              Dayının potansiyel müşterilerini, bütçelerini ve taleplerini
              buradan takip edebilirsin.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            + Yeni Müşteri Ekle
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Müşteri Tablosu */}
        <div className="bg-white rounded-2xl border border-novis-bronze/20 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Yükleniyor...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Henüz kayıtlı müşteri bulunmuyor.
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
                    <th className="p-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-bold text-novis-anthracite">
                        {customer.name}
                      </td>
                      <td className="p-4 text-gray-600">
                        {customer.phone || "-"}
                      </td>
                      <td className="p-4 text-gray-600 font-medium">
                        {customer.budget
                          ? `${Number(customer.budget).toLocaleString("tr-TR")} TL`
                          : "-"}
                      </td>
                      <td className="p-4 text-gray-600">
                        {customer.demand || "-"}
                      </td>
                      <td className="p-4">{getStatusBadge(customer.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition"
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

        {/* Yeni Müşteri Modal / Form Alanı */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-novis-bronze/20 my-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-novis-anthracite">
                  Yeni Müşteri Ekle
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    onClick={() => setShowModal(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit">Müşteriyi Kaydet</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
