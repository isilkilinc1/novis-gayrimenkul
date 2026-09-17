import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPropertyById } from "../services/propertyService";
import Button from "./ui/Button";

const PROPERTY_TYPE_LABELS = {
  HOUSE: "Konut",
  COMMERCIAL: "İşyeri",
  LAND: "Arsa",
};

const LISTING_TYPE_LABELS = {
  SALE: "Satılık",
  RENT: "Kiralık",
};

const PROPERTY_STATUS_LABELS = {
  ACTIVE: "Aktif",
  INACTIVE: "Yayından Kaldırıldı",
  SOLD: "Satıldı",
  RENTED: "Kiralandı",
};

const formatPropertyPrice = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toLocaleString("tr-TR")} TL`;
};

const normalizePropertyData = (item) => {
  if (!item) return null;
  const id = item.id ?? item.property_id;
  if (!id && !item.title && !item.property_title) return null;

  return {
    id,
    title: item.title ?? item.property_title ?? "İlan Başlığı Yok",
    property_type: item.property_type,
    listing_type: item.listing_type ?? item.property_listing_type,
    status: item.status ?? item.property_status,
    cover_image: item.cover_image ?? item.property_cover_image,
    city: item.city ?? item.property_city,
    district: item.district ?? item.property_district,
    neighborhood: item.neighborhood ?? item.property_neighborhood,
    rooms: item.rooms ?? item.property_rooms,
    square_meters: item.square_meters ?? item.property_square_meters,
    floor: item.floor ?? item.property_floor,
    price:
      item.price !== undefined && item.price !== null
        ? item.price
        : item.property_original_price,
    address: item.address ?? item.property_address,
  };
};

export function PropertyInfoCard({ property, item, onEditClick }) {
  const prop = normalizePropertyData(property || item);

  if (!prop || !prop.id) {
    return (
      <div className="rounded-xl border border-gray-200 p-3.5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-novis-anthracite">
            🏢 İlgili İlan Bilgileri
          </h4>
        </div>
        <p className="text-xs text-gray-400">
          Bu ilana ait detay bulunamadı veya ilan silinmiş.
        </p>
      </div>
    );
  }

  const typeIcon =
    prop.property_type === "LAND"
      ? "🌳"
      : prop.property_type === "COMMERCIAL"
        ? "🏪"
        : "🏠";

  const locationText =
    [prop.city, prop.district, prop.neighborhood]
      .filter(Boolean)
      .join(" / ") || "Konum bilgisi yok";

  return (
    <div className="rounded-xl border border-gray-200 p-3.5 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs uppercase tracking-wider text-novis-anthracite">
          🏢 İlgili İlan Bilgileri
        </h4>
        {prop.id && (
          <Link
            to={`/admin/ilanlar/${prop.id}/duzenle`}
            onClick={onEditClick}
            className="text-xs font-semibold text-novis-bronze hover:text-novis-gold hover:underline inline-flex items-center gap-1"
          >
            İlanı Düzenle ↗
          </Link>
        )}
      </div>

      <div>
        <div className="flex gap-3 items-start">
          {prop.cover_image ? (
            <img
              src={prop.cover_image}
              alt={prop.title}
              className="w-16 h-16 rounded-lg object-cover border border-novis-bronze/20 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-novis-cream flex items-center justify-center text-xl border border-novis-bronze/20 shrink-0">
              {typeIcon}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <Link
              to={`/admin/ilanlar/${prop.id}/duzenle`}
              onClick={onEditClick}
              className="font-bold text-novis-anthracite hover:text-novis-gold transition line-clamp-1 break-words"
            >
              #{prop.id} - {prop.title}
            </Link>

            <div className="text-xs text-novis-brown mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
              <span className="font-semibold">
                {PROPERTY_TYPE_LABELS[prop.property_type] || "Belirtilmemiş"}
              </span>
              <span>·</span>
              <span>{LISTING_TYPE_LABELS[prop.listing_type] || ""}</span>
              {prop.status && (
                <>
                  <span>·</span>
                  <span className="text-gray-500">
                    {PROPERTY_STATUS_LABELS[prop.status] || prop.status}
                  </span>
                </>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-1 break-words">
              {locationText}
            </div>
          </div>
        </div>

        {/* Ek İlan Detayları */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600">
          {prop.rooms && (
            <div>
              <span className="text-gray-400">Oda Sayısı:</span>{" "}
              <span className="font-semibold text-novis-anthracite">
                {prop.rooms}
              </span>
            </div>
          )}
          {prop.square_meters && (
            <div>
              <span className="text-gray-400">Alan:</span>{" "}
              <span className="font-semibold text-novis-anthracite">
                {prop.square_meters} m²
              </span>
            </div>
          )}
          {prop.floor && (
            <div>
              <span className="text-gray-400">Bulunduğu Kat:</span>{" "}
              <span className="font-semibold text-novis-anthracite">
                {prop.floor}
              </span>
            </div>
          )}
          {prop.price !== undefined && prop.price !== null && (
            <div>
              <span className="text-gray-400">Liste Fiyatı:</span>{" "}
              <span className="font-semibold text-novis-anthracite">
                {formatPropertyPrice(prop.price)}
              </span>
            </div>
          )}
          {prop.address && (
            <div className="col-span-2 text-gray-500 mt-1 break-words">
              <span className="text-gray-400">Adres:</span> {prop.address}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailsModal({
  propertyId,
  property,
  isOpen = true,
  onClose,
  title = "🏢 İlgili İlan Bilgileri",
}) {
  const navigate = useNavigate();
  const [fetchedProperty, setFetchedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const targetId = propertyId || property?.id || property?.property_id;

  const hasDetails = Boolean(
    property &&
      (property.city !== undefined ||
        property.property_city !== undefined ||
        property.address !== undefined ||
        property.property_address !== undefined ||
        property.rooms !== undefined ||
        property.property_rooms !== undefined),
  );

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || hasDetails) return;

    if (targetId) {
      let isMounted = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      setError("");

      getPropertyById(targetId)
        .then((data) => {
          if (isMounted) {
            setFetchedProperty(data);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error("İlan detayları yüklenemedi:", err);
            setError(
              err?.response?.status === 404
                ? "Bu ilana ait detay bulunamadı veya ilan silinmiş."
                : "İlan bilgileri yüklenirken bir sorun oluştu.",
            );
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, targetId, hasDetails]);

  if (!isOpen) return null;

  const currentProperty = hasDetails ? property : fetchedProperty;
  const prop = normalizePropertyData(currentProperty);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="my-8 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-novis-bronze/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold text-novis-anthracite">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg font-bold cursor-pointer"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            İlan bilgileri yükleniyor...
          </div>
        ) : error && !prop ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" size="sm" onClick={onClose}>
                Kapat
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <PropertyInfoCard property={currentProperty} onEditClick={onClose} />

            <div className="flex justify-end gap-2 pt-3 border-t">
              {prop?.id && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate(`/admin/ilanlar/${prop.id}/duzenle`);
                  }}
                >
                  İlanı Düzenle ↗
                </Button>
              )}
              <Button type="button" size="sm" onClick={onClose}>
                Kapat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
