import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  deleteTransaction,
  exportTransactions,
  getCustomerTransactionHistory,
  getTransactions,
  updateTransaction,
} from "../../services/transactionService";
import { getCustomers } from "../../services/customerService";
import Container from "../../components/ui/Container";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { PropertyInfoCard } from "../../components/PropertyDetailsModal";

const types = { HOUSE: "Konut", COMMERCIAL: "İşyeri", LAND: "Arsa" };
const listingTypes = { SALE: "Satılık", RENT: "Kiralık" };

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "-";

const price = (value) =>
  value === null || value === undefined
    ? "-"
    : `${Number(value).toLocaleString("tr-TR")} TL`;

const transactionLabel = (value) => (value === "SOLD" ? "Satış" : "Kiralama");

export default function TransactionHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    transactionType: "",
    propertyType: "",
    fromDate: "",
    toDate: "",
    sort: "date_desc",
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [modalError, setModalError] = useState("");

  const query = useCallback(
    () => ({
      ...filters,
      search: filters.search.trim() || undefined,
      transactionType: filters.transactionType || undefined,
      propertyType: filters.propertyType || undefined,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      page,
      limit: 20,
    }),
    [filters, page],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getTransactions(query());
      setTransactions(result.data || []);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "İşlem geçmişi yüklenirken bir hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, []);

  const change = (key, value) => {
    setFilters((old) => ({ ...old, [key]: value }));
    setPage(1);
  };

  const badge = (value) => (
    <Badge variant={value === "SOLD" ? "success" : "bronze"}>
      {transactionLabel(value)}
    </Badge>
  );

  const exportExcel = async () => {
    try {
      const data = await exportTransactions(query());
      const rows = data.map((item) => ({
        "İşlem Tarihi": date(item.transaction_date),
        "İşlem Türü": transactionLabel(item.transaction_type),
        Müşteri: item.customer_name || "Müşteri artık mevcut değil",
        Telefon: item.customer_phone || "",
        "E-posta": item.customer_email || "",
        "İlgili İlan": item.property_title
          ? `#${item.property_id} - ${item.property_title}`
          : "İlan artık mevcut değil",
        "İlan Türü": types[item.property_type] || "",
        "Kategori / Durum": listingTypes[item.property_listing_type] || "",
        Şehir: item.property_city || "",
        İlçe: item.property_district || "",
        Mahalle: item.property_neighborhood || "",
        "İşlem Fiyatı": item.final_price ?? "",
        Not: item.notes || "",
      }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        book,
        XLSX.utils.json_to_sheet(rows),
        "İşlem Geçmişi",
      );
      XLSX.writeFile(book, "novis-islem-gecmisi.xlsx");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Excel dışa aktarma başarısız oldu.",
      );
    }
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    try {
      setModalError("");
      await updateTransaction(editing.id, {
        transactionDate: editing.transaction_date,
        transactionType: editing.transaction_type,
        finalPrice: editing.final_price ? Number(editing.final_price) : null,
        notes: editing.notes,
        customerId: editing.customer_id ? Number(editing.customer_id) : null,
      });
      setEditing(null);
      await load();
    } catch (err) {
      setModalError(
        err?.response?.data?.message || "İşlem kaydı güncellenemedi.",
      );
    }
  };

  const remove = async () => {
    try {
      setModalError("");
      await deleteTransaction(deleting.id);
      setDeleting(null);
      setSelected(null);
      await load();
    } catch (err) {
      setModalError(
        err?.response?.data?.message || "İşlem kaydı silinemedi.",
      );
    }
  };

  const openCustomerHistory = async (customerId) => {
    try {
      setModalError("");
      setCustomerHistory(await getCustomerTransactionHistory(customerId));
    } catch (err) {
      setModalError(
        err?.response?.data?.message || "Müşteri geçmişi yüklenemedi.",
      );
    }
  };

  useEffect(() => {
    if (location.state?.customerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openCustomerHistory(location.state.customerId);
    }
  }, [location.state]);

  const pageNumbers = Array.from(
    { length: Math.min(5, pagination.totalPages) },
    (_, index) =>
      Math.min(
        Math.max(page - 2, 1),
        Math.max(pagination.totalPages - 4, 1),
      ) + index,
  );

  return (
    <Container>
      <div className="py-8 max-w-7xl mx-auto print-area">
        <header className="mb-6 print-header">
          <h1 className="font-display text-3xl font-bold text-novis-anthracite">
            NOVIS GAYRİMENKUL <span className="print-only">— </span>İşlem Geçmişi
          </h1>
          <p className="mt-1 text-sm text-novis-brown">
            Satış ve kiralama arşivini yönetin. Kime ne sattığınızı veya kiraladığınızı buradan detaylı inceleyin.
          </p>
          <p className="hidden print:block text-xs mt-1 text-gray-500">
            İşlem: {filters.transactionType ? transactionLabel(filters.transactionType) : "Hepsi"} ·
            İlan Türü: {types[filters.propertyType] || "Hepsi"} ·
            Tarih: {filters.fromDate || "Başlangıç"} - {filters.toDate || "Bitiş"} ·
            Arama: {filters.search || "Yok"}
          </p>
        </header>

        {/* FİLTRELEME ÇUBUĞU */}
        <div className="no-print mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-novis-bronze/20 bg-white p-4 md:grid-cols-5">
          <input
            type="search"
            value={filters.search}
            onChange={(e) => change("search", e.target.value)}
            placeholder="Müşteri, ilan veya konum ara..."
            className="rounded-xl border border-novis-bronze/30 px-3 py-2 text-sm md:col-span-2 focus:outline-none focus:ring-1 focus:ring-novis-bronze"
          />

          <select
            value={filters.transactionType}
            onChange={(e) => change("transactionType", e.target.value)}
            className="rounded-xl border border-novis-bronze/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
          >
            <option value="">İşlem: Hepsi</option>
            <option value="SOLD">Satış</option>
            <option value="RENTED">Kiralama</option>
          </select>

          <select
            value={filters.propertyType}
            onChange={(e) => change("propertyType", e.target.value)}
            className="rounded-xl border border-novis-bronze/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
          >
            <option value="">İlan Türü: Hepsi</option>
            <option value="HOUSE">Konut</option>
            <option value="COMMERCIAL">İşyeri</option>
            <option value="LAND">Arsa</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => change("sort", e.target.value)}
            className="rounded-xl border border-novis-bronze/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
          >
            <option value="date_desc">En yeni</option>
            <option value="date_asc">En eski</option>
            <option value="customer_asc">Müşteri A-Z</option>
            <option value="customer_desc">Müşteri Z-A</option>
            <option value="property_asc">İlan A-Z</option>
            <option value="property_desc">İlan Z-A</option>
          </select>

          <label className="text-xs text-novis-brown">
            Başlangıç
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => change("fromDate", e.target.value)}
              className="mt-1 w-full rounded-xl border border-novis-bronze/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
            />
          </label>

          <label className="text-xs text-novis-brown">
            Bitiş
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => change("toDate", e.target.value)}
              className="mt-1 w-full rounded-xl border border-novis-bronze/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
            />
          </label>

          <div className="flex items-end gap-2 md:col-span-3">
            <Button size="sm" onClick={exportExcel}>
              📥 Excel'e Aktar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              🖨️ Yazdır / PDF
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* TABLO VE MOBİL LİSTE */}
        <div>
          {loading ? (
            <div className="rounded-2xl border border-novis-bronze/20 bg-white p-10 text-center text-gray-500 text-sm">
              İşlem geçmişi yükleniyor...
            </div>
          ) : error ? null : transactions.length === 0 ? (
            <div className="rounded-2xl border border-novis-bronze/20 bg-white p-10 text-center text-gray-500 text-sm">
              Henüz kayıtlı işlem bulunmuyor.
            </div>
          ) : (
            <>
              {/* MOBİL KART LİSTESİ (md altı ekranlar) */}
              <div className="md:hidden space-y-3.5">
                {transactions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="bg-white rounded-2xl border border-novis-bronze/20 p-4 shadow-xs space-y-3 cursor-pointer"
                  >
                    {/* Üst: Tarih, Tür ve Fiyat */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {badge(item.transaction_type)}
                          <span className="text-xs text-gray-500">
                            {date(item.transaction_date)}
                          </span>
                        </div>
                        <p className="font-bold text-novis-anthracite text-base mt-1.5">
                          {item.customer_name || "Müşteri artık mevcut değil"}
                        </p>
                        {item.customer_phone && (
                          <p className="text-xs text-novis-brown mt-0.5">
                            📞 {item.customer_phone}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-gray-400 block uppercase font-semibold">Fiyat</span>
                        <span className="font-bold text-novis-gold text-base">
                          {price(item.final_price)}
                        </span>
                      </div>
                    </div>

                    {/* İlgili İlan */}
                    {item.property_id ? (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-novis-anthracite font-semibold truncate">
                          🏢 #{item.property_id} - {item.property_title || "İlan Başlığı Yok"}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {[types[item.property_type], item.property_city, item.property_district].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    ) : null}

                    {/* Not */}
                    {item.notes && (
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs text-gray-600">
                        <span className="font-semibold block text-[11px] text-gray-500 mb-0.5">İşlem Notu:</span>
                        {item.notes}
                      </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div
                      className="no-print pt-2 border-t border-gray-100 grid grid-cols-3 gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="text-novis-bronze hover:text-novis-brown text-xs font-semibold py-2 px-1 bg-novis-cream rounded-xl transition text-center cursor-pointer"
                      >
                        Detay
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing({
                            ...item,
                            transaction_date: item.transaction_date?.slice(0, 10) || "",
                          });
                          setModalError("");
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold py-2 px-1 bg-blue-50 rounded-xl transition text-center cursor-pointer"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleting(item);
                          setModalError("");
                        }}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold py-2 px-1 bg-red-50 rounded-xl transition text-center cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* MASAÜSTÜ TABLO (md ve üzeri ekranlar) */}
              <div className="hidden md:block overflow-hidden rounded-2xl border border-novis-bronze/20 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-novis-cream/40 border-b border-novis-bronze/10 text-xs font-bold text-novis-anthracite uppercase">
                        <th className="p-4">Tarih</th>
                        <th className="p-4">İşlem</th>
                        <th className="p-4">Müşteri</th>
                        <th className="p-4">İLGİLİ İLAN</th>
                        <th className="p-4">Tür</th>
                        <th className="p-4">Fiyat</th>
                        <th className="p-4">Not</th>
                        <th className="no-print p-4 text-right">Aksiyon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {transactions.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelected(item)}
                          className="cursor-pointer hover:bg-gray-50/80 transition"
                        >
                          <td className="p-4 font-medium text-gray-700 whitespace-nowrap">
                            {date(item.transaction_date)}
                          </td>

                          <td className="p-4">{badge(item.transaction_type)}</td>

                          <td className="p-4">
                            <div className="font-bold text-novis-anthracite">
                              {item.customer_name || "Müşteri artık mevcut değil"}
                            </div>
                            {item.customer_phone && (
                              <div className="text-xs text-novis-brown mt-0.5">
                                📞 {item.customer_phone}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            {item.property_id ? (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(item);
                                }}
                                className="inline-flex flex-col text-left group cursor-pointer"
                                title="İşlem ve İlan Detaylarını Görüntüle"
                              >
                                <span className="font-bold text-novis-anthracite group-hover:text-novis-gold transition underline decoration-dotted max-w-[220px] truncate">
                                  🏢 #{item.property_id} - {item.property_title || "İlan Başlığı Yok"}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                  {[item.property_city, item.property_district].filter(Boolean).join(" / ")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">İlan artık mevcut değil</span>
                            )}
                          </td>

                          <td className="p-4 text-gray-600">
                            {types[item.property_type] || "-"}
                          </td>

                          <td className="p-4 font-bold text-novis-anthracite whitespace-nowrap">
                            {price(item.final_price)}
                          </td>

                          <td className="p-4 max-w-xs truncate text-gray-500" title={item.notes}>
                            {item.notes || "-"}
                          </td>

                          <td
                            className="no-print p-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelected(item)}
                              className="text-novis-bronze hover:text-novis-brown text-xs font-semibold px-2.5 py-1.5 bg-novis-cream hover:bg-novis-gold/20 rounded-lg transition mr-2 cursor-pointer"
                            >
                              Detay
                            </button>
                            <button
                              onClick={() => {
                                setEditing({
                                  ...item,
                                  transaction_date: item.transaction_date?.slice(0, 10) || "",
                                });
                                setModalError("");
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition mr-2 cursor-pointer"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => {
                                setDeleting(item);
                                setModalError("");
                              }}
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

        {!loading && !error && pagination.totalPages > 1 && (
          <nav className="no-print mt-6 flex justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Önceki
            </Button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  page === number
                    ? "bg-novis-anthracite text-white"
                    : "bg-white text-novis-anthracite border border-novis-bronze/20"
                }`}
              >
                {number}
              </button>
            ))}
            <Button
              size="sm"
              variant="secondary"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Sonraki
            </Button>
          </nav>
        )}

        {/* DETAY MODALI */}
        {selected && (
          <Modal title="İşlem & İlan Detayı" close={() => setSelected(null)}>
            <Detail
              item={selected}
              badge={badge}
              openCustomerHistory={openCustomerHistory}
              onClose={() => setSelected(null)}
              navigate={navigate}
            />
          </Modal>
        )}

        {/* DÜZENLEME MODALI */}
        {editing && (
          <Modal title="İşlem Kaydını Düzenle" close={() => setEditing(null)}>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-novis-anthracite uppercase mb-1">
                  İşlem Tarihi *
                </label>
                <input
                  required
                  type="date"
                  value={editing.transaction_date}
                  onChange={(e) =>
                    setEditing({ ...editing, transaction_date: e.target.value })
                  }
                  className="w-full rounded-xl border border-novis-bronze/30 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-novis-anthracite uppercase mb-1">
                  İşlem Türü *
                </label>
                <select
                  value={editing.transaction_type}
                  onChange={(e) =>
                    setEditing({ ...editing, transaction_type: e.target.value })
                  }
                  className="w-full rounded-xl border border-novis-bronze/30 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                >
                  <option value="SOLD">Satış</option>
                  <option value="RENTED">Kiralama</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-novis-anthracite uppercase mb-1">
                  Müşteri
                </label>
                <select
                  value={editing.customer_id || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, customer_id: e.target.value })
                  }
                  className="w-full rounded-xl border border-novis-bronze/30 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                >
                  <option value="">Müşteri seçin</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name || customer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-novis-anthracite uppercase mb-1">
                  İşlem Fiyatı (TL) *
                </label>
                <input
                  required
                  min="0"
                  type="number"
                  value={editing.final_price ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, final_price: e.target.value })
                  }
                  className="w-full rounded-xl border border-novis-bronze/30 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-novis-anthracite uppercase mb-1">
                  Not
                </label>
                <textarea
                  value={editing.notes || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full rounded-xl border border-novis-bronze/30 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-novis-bronze"
                />
              </div>

              {modalError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                  {modalError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(null)}
                >
                  İptal
                </Button>
                <Button type="submit">Güncellemeyi Kaydet</Button>
              </div>
            </form>
          </Modal>
        )}

        {/* SİLME ONAY MODALI */}
        {deleting && (
          <Modal title="İşlem Kaydını Sil" close={() => setDeleting(null)}>
            <p className="text-sm text-gray-700">
              Bu işlem kaydını arşivden silmek istediğinize emin misiniz?
            </p>
            <div className="my-4 rounded-xl bg-novis-cream/60 border border-novis-bronze/20 p-4 text-sm">
              <div className="font-bold text-novis-anthracite">
                {deleting.customer_name || "Müşteri artık mevcut değil"}
              </div>
              <div className="text-xs text-novis-brown mt-0.5">
                {deleting.property_title ? `#${deleting.property_id} - ${deleting.property_title}` : "İlan artık mevcut değil"}
              </div>
              <div className="mt-2 text-xs font-semibold text-novis-anthracite">
                {transactionLabel(deleting.transaction_type)} · {date(deleting.transaction_date)} · {price(deleting.final_price)}
              </div>
            </div>
            {modalError && (
              <p className="text-sm text-red-600 mb-4">{modalError}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                Vazgeç
              </Button>
              <Button onClick={remove} className="bg-red-600 hover:bg-red-700 text-white">
                Sil
              </Button>
            </div>
          </Modal>
        )}

        {/* MÜŞTERİ GEÇMİŞİ MODALI */}
        {customerHistory && (
          <Modal
            title="Müşteri İşlem Geçmişi"
            close={() => setCustomerHistory(null)}
          >
            <div className="bg-novis-cream/50 p-4 rounded-xl border border-novis-bronze/20 mb-4">
              <p className="font-bold text-novis-anthracite">
                👤 {customerHistory.customer.full_name}
              </p>
              <p className="text-xs text-novis-brown mt-1">
                Toplam İşlem: <span className="font-bold">{customerHistory.summary.total}</span> (Satış: {customerHistory.summary.sold}, Kiralama: {customerHistory.summary.rented})
              </p>
            </div>

            {customerHistory.data.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                Bu müşteriye ait kayıtlı işlem bulunmuyor.
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {customerHistory.data.map((item) => (
                  <div key={item.id} className="py-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-novis-anthracite">
                        {item.property_title || `İlan #${item.property_id}`}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {date(item.transaction_date)} · {transactionLabel(item.transaction_type)}
                      </div>
                    </div>
                    <div className="font-bold text-novis-anthracite text-xs">
                      {price(item.final_price)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )}
      </div>
    </Container>
  );
}

function Modal({ title, close, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="my-8 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-novis-bronze/20">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold text-novis-anthracite">{title}</h2>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Detail({ item, badge, openCustomerHistory, onClose, navigate }) {
  return (
    <div className="space-y-4 text-sm">
      {/* İŞLEM ÖZET KARTI ("Kime Ne Satmışız / Kiralamışız?") */}
      <div className="rounded-2xl bg-novis-cream/70 border border-novis-bronze/20 p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-novis-brown">
            İşlem Özeti
          </span>
          {badge(item.transaction_type)}
        </div>

        <div className="text-base font-bold text-novis-anthracite">
          {item.customer_name || "Müşteri"} 
          <span className="text-novis-brown font-normal"> kişisine </span>
          {item.transaction_type === "SOLD" ? "satış yapıldı" : "kiralama yapıldı"}.
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-novis-bronze/10">
          <div>
            <div className="text-xs text-novis-brown">İşlem Fiyatı</div>
            <div className="text-base font-extrabold text-novis-anthracite">
              {price(item.final_price)}
            </div>
          </div>
          <div>
            <div className="text-xs text-novis-brown">İşlem Tarihi</div>
            <div className="text-sm font-semibold text-novis-anthracite">
              {date(item.transaction_date)}
            </div>
          </div>
        </div>
      </div>

      {/* MÜŞTERİ BİLGİLERİ */}
      <div className="rounded-xl border border-gray-200 p-3.5 bg-white space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-novis-anthracite">
            👤 Müşteri Bilgileri
          </h4>
          {item.customer_id && (
            <button
              type="button"
              onClick={() => openCustomerHistory(item.customer_id)}
              className="text-xs font-semibold text-novis-bronze hover:underline"
            >
              Tüm İşlemleri →
            </button>
          )}
        </div>
        <div className="text-novis-anthracite font-medium">
          {item.customer_name || "Müşteri artık mevcut değil"}
        </div>
        {item.customer_phone && (
          <div className="text-xs">
            <a
              href={`tel:${item.customer_phone}`}
              className="text-novis-brown hover:underline inline-flex items-center gap-1"
            >
              📞 {item.customer_phone}
            </a>
          </div>
        )}
        {item.customer_email && (
          <div className="text-xs">
            <a
              href={`mailto:${item.customer_email}`}
              className="text-gray-500 hover:underline inline-flex items-center gap-1"
            >
              ✉️ {item.customer_email}
            </a>
          </div>
        )}
      </div>

      {/* İLGİLİ İLAN BİLGİLERİ */}
      <PropertyInfoCard item={item} />

      {/* İŞLEM NOTLARI */}
      {item.notes && (
        <div className="rounded-xl border border-gray-200 p-3.5 bg-white">
          <h4 className="font-bold text-xs uppercase tracking-wider text-novis-anthracite mb-1">
            📝 İşlem Notları
          </h4>
          <p className="text-xs text-gray-700 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      {/* AKSİYON BUTONLARI */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        {item.property_id && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              navigate(`/admin/ilanlar/${item.property_id}/duzenle`);
            }}
          >
            İlana Git
          </Button>
        )}
        <Button type="button" size="sm" onClick={onClose}>
          Kapat
        </Button>
      </div>
    </div>
  );
}
