import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { deleteTransaction, exportTransactions, getCustomerTransactionHistory, getTransactions, updateTransaction } from "../../services/transactionService";
import { getCustomers } from "../../services/customerService";
import Container from "../../components/ui/Container";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const types = { HOUSE: "Konut", COMMERCIAL: "İşyeri", LAND: "Arsa" };
const listingTypes = { SALE: "Satılık", RENT: "Kiralık" };
const date = (value) => (value ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value)) : "-");
const price = (value) => (value === null || value === undefined ? "-" : `${Number(value).toLocaleString("tr-TR")} TL`);
const transactionLabel = (value) => (value === "SOLD" ? "Satış" : "Kiralama");

export default function TransactionHistory() {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", transactionType: "", propertyType: "", fromDate: "", toDate: "", sort: "date_desc" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [modalError, setModalError] = useState("");

  const query = useCallback(() => ({ ...filters, search: filters.search.trim() || undefined, transactionType: filters.transactionType || undefined, propertyType: filters.propertyType || undefined, fromDate: filters.fromDate || undefined, toDate: filters.toDate || undefined, page, limit: 20 }), [filters, page]);
  const load = useCallback(async () => { try { setLoading(true); setError(""); const result = await getTransactions(query()); setTransactions(result.data || []); setPagination(result.pagination); } catch (err) { setError(err?.response?.data?.message || "İşlem geçmişi yüklenirken bir hata oluştu."); } finally { setLoading(false); } }, [query]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);
  useEffect(() => { getCustomers().then(setCustomers).catch(() => setCustomers([])); }, []);

  const change = (key, value) => { setFilters((old) => ({ ...old, [key]: value })); setPage(1); };
  const badge = (value) => <Badge variant={value === "SOLD" ? "success" : "bronze"}>{transactionLabel(value)}</Badge>;
  const exportExcel = async () => {
    try {
      const data = await exportTransactions(query());
      const rows = data.map((item) => ({ "İşlem Tarihi": date(item.transaction_date), "İşlem Türü": transactionLabel(item.transaction_type), Müşteri: item.customer_name || "Müşteri artık mevcut değil", Telefon: item.customer_phone || "", "E-posta": item.customer_email || "", Taşınmaz: item.property_title || "Taşınmaz artık mevcut değil", "Taşınmaz Türü": types[item.property_type] || "", "İlan Türü": listingTypes[item.property_listing_type] || "", Şehir: item.property_city || "", İlçe: item.property_district || "", Mahalle: item.property_neighborhood || "", Fiyat: item.final_price ?? "", Not: item.notes || "" }));
      const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, XLSX.utils.json_to_sheet(rows), "İşlem Geçmişi"); XLSX.writeFile(book, "novis-islem-gecmisi.xlsx");
    } catch (err) { setError(err?.response?.data?.message || "Excel dışa aktarma başarısız oldu."); }
  };
  const saveEdit = async (event) => { event.preventDefault(); try { setModalError(""); await updateTransaction(editing.id, { transactionDate: editing.transaction_date, transactionType: editing.transaction_type, finalPrice: editing.final_price, notes: editing.notes, customerId: editing.customer_id }); setEditing(null); await load(); } catch (err) { setModalError(err?.response?.data?.message || "İşlem kaydı güncellenemedi."); } };
  const remove = async () => { try { setModalError(""); await deleteTransaction(deleting.id); setDeleting(null); setSelected(null); await load(); } catch (err) { setModalError(err?.response?.data?.message || "İşlem kaydı silinemedi."); } };
  const openCustomerHistory = async (customerId) => { try { setModalError(""); setCustomerHistory(await getCustomerTransactionHistory(customerId)); } catch (err) { setModalError(err?.response?.data?.message || "Müşteri geçmişi yüklenemedi."); } };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (location.state?.customerId) openCustomerHistory(location.state.customerId);
    // This optional navigation state is only read when arriving from Customers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pageNumbers = Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => Math.min(Math.max(page - 2, 1), Math.max(pagination.totalPages - 4, 1)) + index);

  return <Container><div className="py-8 max-w-7xl mx-auto print-area">
    <header className="mb-6 print-header"><h1 className="font-display text-3xl font-bold text-novis-anthracite">NOVIS GAYRİMENKUL <span className="print-only">— </span>İşlem Geçmişi</h1><p className="mt-1 text-sm text-novis-brown">Satış ve kiralama arşivini yönetin.</p><p className="hidden print:block">İşlem: {filters.transactionType ? transactionLabel(filters.transactionType) : "Hepsi"} · Taşınmaz: {types[filters.propertyType] || "Hepsi"} · Tarih: {filters.fromDate || "Başlangıç"} - {filters.toDate || "Bitiş"} · Arama: {filters.search || "Yok"}</p></header>
    <div className="no-print mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-novis-bronze/20 bg-white p-4 md:grid-cols-5">
      <input type="search" value={filters.search} onChange={(e) => change("search", e.target.value)} placeholder="Müşteri, taşınmaz veya konum ara..." className="rounded-xl border border-novis-bronze/30 px-3 py-2 md:col-span-2" />
      <select value={filters.transactionType} onChange={(e) => change("transactionType", e.target.value)} className="rounded-xl border border-novis-bronze/30 px-3 py-2"><option value="">İşlem: Hepsi</option><option value="SOLD">Satış</option><option value="RENTED">Kiralama</option></select>
      <select value={filters.propertyType} onChange={(e) => change("propertyType", e.target.value)} className="rounded-xl border border-novis-bronze/30 px-3 py-2"><option value="">Taşınmaz: Hepsi</option><option value="HOUSE">Konut</option><option value="COMMERCIAL">İşyeri</option><option value="LAND">Arsa</option></select>
      <select value={filters.sort} onChange={(e) => change("sort", e.target.value)} className="rounded-xl border border-novis-bronze/30 px-3 py-2"><option value="date_desc">En yeni</option><option value="date_asc">En eski</option><option value="customer_asc">Müşteri A-Z</option><option value="customer_desc">Müşteri Z-A</option><option value="property_asc">Taşınmaz A-Z</option><option value="property_desc">Taşınmaz Z-A</option></select>
      <label className="text-xs text-novis-brown">Başlangıç<input type="date" value={filters.fromDate} onChange={(e) => change("fromDate", e.target.value)} className="mt-1 w-full rounded-xl border border-novis-bronze/30 px-3 py-2" /></label>
      <label className="text-xs text-novis-brown">Bitiş<input type="date" value={filters.toDate} onChange={(e) => change("toDate", e.target.value)} className="mt-1 w-full rounded-xl border border-novis-bronze/30 px-3 py-2" /></label>
      <div className="flex items-end gap-2 md:col-span-3"><Button size="sm" onClick={exportExcel}>Excel'e Aktar</Button><Button size="sm" variant="secondary" onClick={() => window.print()}>Yazdır / PDF</Button></div>
    </div>
    {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}
    <div className="overflow-hidden rounded-2xl border border-novis-bronze/20 bg-white"><div className="overflow-x-auto">{loading ? <div className="p-10 text-center">İşlem geçmişi yükleniyor...</div> : error ? null : transactions.length === 0 ? <div className="p-10 text-center">Henüz kayıtlı işlem bulunmuyor.</div> : <table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="bg-novis-cream/40 text-xs uppercase"><th className="p-4">Tarih</th><th className="p-4">İşlem</th><th className="p-4">Müşteri</th><th className="p-4">Taşınmaz</th><th className="p-4">Tür</th><th className="p-4">Fiyat</th><th className="p-4">Not</th><th className="no-print p-4">Aksiyon</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id} onClick={() => setSelected(item)} className="cursor-pointer border-t hover:bg-gray-50"><td className="p-4">{date(item.transaction_date)}</td><td className="p-4">{badge(item.transaction_type)}</td><td className="p-4"><b>{item.customer_name || "Müşteri artık mevcut değil"}</b><br />{item.customer_phone || ""}</td><td className="p-4"><b>{item.property_title || "Taşınmaz artık mevcut değil"}</b><br /><small>{[item.property_city, item.property_district, item.property_neighborhood].filter(Boolean).join(" / ")}</small></td><td className="p-4">{types[item.property_type] || "-"}</td><td className="p-4">{price(item.final_price)}</td><td className="p-4 max-w-xs truncate">{item.notes || "-"}</td><td className="no-print p-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}><button onClick={() => setSelected(item)} className="mr-2 text-xs">Detay</button><button onClick={() => { setEditing({ ...item, transaction_date: item.transaction_date?.slice(0, 10) || "" }); setModalError(""); }} className="mr-2 text-xs text-blue-700">Düzenle</button><button onClick={() => { setDeleting(item); setModalError(""); }} className="text-xs text-red-600">Sil</button></td></tr>)}</tbody></table>}</div></div>
    {!loading && !error && pagination.totalPages > 1 && <nav className="no-print mt-6 flex justify-center gap-2"><Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Önceki</Button>{pageNumbers.map((number) => <button key={number} onClick={() => setPage(number)} className="rounded-lg px-3 py-2">{number}</button>)}<Button size="sm" variant="secondary" disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}>Sonraki</Button></nav>}
    {selected && <Modal title="İşlem Detayı" close={() => setSelected(null)}><Detail item={selected} badge={badge} openCustomerHistory={openCustomerHistory} /></Modal>}
    {editing && <Modal title="İşlem Kaydını Düzenle" close={() => setEditing(null)}><form onSubmit={saveEdit} className="space-y-3"><label>İşlem tarihi<input required type="date" value={editing.transaction_date} onChange={(e) => setEditing({ ...editing, transaction_date: e.target.value })} className="mt-1 w-full rounded border p-2" /></label><label>İşlem türü<select value={editing.transaction_type} onChange={(e) => setEditing({ ...editing, transaction_type: e.target.value })} className="mt-1 w-full rounded border p-2"><option value="SOLD">Satış</option><option value="RENTED">Kiralama</option></select></label><label>Müşteri<select value={editing.customer_id || ""} onChange={(e) => setEditing({ ...editing, customer_id: e.target.value })} className="mt-1 w-full rounded border p-2"><option value="">Müşteri seçin</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name || customer.full_name}</option>)}</select></label><label>Fiyat<input required min="0" type="number" value={editing.final_price ?? ""} onChange={(e) => setEditing({ ...editing, final_price: e.target.value })} className="mt-1 w-full rounded border p-2" /></label><label>Not<textarea value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="mt-1 w-full rounded border p-2" /></label>{modalError && <p className="text-sm text-red-600">{modalError}</p>}<Button type="submit">Kaydet</Button></form></Modal>}
    {deleting && <Modal title="İşlem Kaydını Sil" close={() => setDeleting(null)}><p>Bu işlem kaydını silmek istediğinize emin misiniz?</p><div className="my-4 rounded bg-novis-cream p-3 text-sm"><b>{deleting.customer_name || "Müşteri artık mevcut değil"}</b><br />{deleting.property_title || "Taşınmaz artık mevcut değil"}<br />{transactionLabel(deleting.transaction_type)} · {date(deleting.transaction_date)}</div>{modalError && <p className="text-sm text-red-600">{modalError}</p>}<div className="flex gap-2"><Button variant="secondary" onClick={() => setDeleting(null)}>Vazgeç</Button><Button onClick={remove} className="bg-red-600 text-white">Sil</Button></div></Modal>}
    {customerHistory && <Modal title="Müşteri İşlem Geçmişi" close={() => setCustomerHistory(null)}><p><b>Müşteri:</b> {customerHistory.customer.full_name}</p><p>Toplam işlem: {customerHistory.summary.total} · Satış: {customerHistory.summary.sold} · Kiralama: {customerHistory.summary.rented}</p>{customerHistory.data.length === 0 ? <p className="mt-4">Bu müşteriye ait kayıtlı işlem bulunmuyor.</p> : <div className="mt-4 max-h-72 overflow-auto">{customerHistory.data.map((item) => <div key={item.id} className="border-t py-2 text-sm">{date(item.transaction_date)} · {transactionLabel(item.transaction_type)} · {item.property_title || "Taşınmaz artık mevcut değil"} · {price(item.final_price)}</div>)}</div>}</Modal>}
  </div></Container>;
}

function Modal({ title, close, children }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6"><div className="mb-4 flex justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={close} aria-label="Kapat">×</button></div>{children}</div></div>; }
function Detail({ item, badge, openCustomerHistory }) { return <div className="space-y-3 text-sm"><h3 className="font-bold">İşlem Bilgileri</h3><p>{badge(item.transaction_type)} · {date(item.transaction_date)} · {price(item.final_price)}</p><p className="whitespace-pre-wrap">{item.notes || "Not bulunmuyor."}</p><h3 className="font-bold">Müşteri</h3><p>{item.customer_name || "Müşteri artık mevcut değil"}<br />{item.customer_phone || ""}<br />{item.customer_email || ""}</p>{item.customer_id && <button onClick={() => openCustomerHistory(item.customer_id)} className="text-novis-bronze">Müşteri İşlem Geçmişi</button>}<h3 className="font-bold">Taşınmaz</h3><p>{item.property_title || "Taşınmaz artık mevcut değil"}<br />{types[item.property_type] || ""} · {listingTypes[item.property_listing_type] || ""}<br />{[item.property_city, item.property_district, item.property_neighborhood].filter(Boolean).join(" / ")}<br />{item.property_address || ""}</p></div>; }
