/**
 * Fiyat alanını Türkçe binlik ayırıcı (.) formatına dönüştürür.
 * Örnek: 1000 -> "1.000", 2500000 -> "2.500.000"
 * @param {string|number} val
 * @returns {string}
 */
export const formatPriceInput = (val) => {
  if (val === null || val === undefined || val === "") return "";
  // Sadece rakamları ayıkla
  const cleanDigits = String(val).replace(/\D/g, "");
  if (!cleanDigits) return "";
  // Başlangıçtaki gereksiz sıfırları temizle (tek başına 0 hariç)
  const normalized = cleanDigits.replace(/^0+(?=\d)/, "");
  // 3 basamakta bir nokta ekle
  return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Formatlanmış fiyat metnini (örn: "2.500.000") sayısal değere (2500000) dönüştürür.
 * @param {string|number} val
 * @returns {number}
 */
export const parsePriceInput = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const cleanDigits = String(val).replace(/\D/g, "");
  return cleanDigits ? Number(cleanDigits) : 0;
};
