import { Link } from "react-router-dom";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import { getFullImageUrl } from "../utils/imageUrl";

function PropertyCard({ property }) {
  // İlanın gerçek kapak fotoğrafı varsa onu kullan.
  // Fotoğraf yoksa gayrimenkul türüne göre özel placeholder göster.
  let imageUrl;

  if (property.cover_image) {
    imageUrl = getFullImageUrl(property.cover_image);
  } else {
    switch (property.property_type) {
      case "LAND":
        imageUrl = "/images/land-placeholder.jpg";
        break;

      case "COMMERCIAL":
        imageUrl = "/images/commercial-placeholder.jpg";
        break;

      case "HOUSE":
      default:
        imageUrl = "/images/property-placeholder.jpg";
        break;
    }
  }

  const isVideoCover =
    property.cover_media_type === "video" ||
    Boolean(property.cover_image?.match(/\.(mp4|webm|mov|avi|mkv)$/i));

  return (
    <article className="overflow-hidden rounded-2xl border border-novis-bronze/20 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Medya Alanı */}
      <div className="relative h-48 sm:h-56 bg-novis-bronze/10 overflow-hidden">
        {isVideoCover ? (
          <video
            src={imageUrl}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover bg-black pointer-events-none"
          />
        ) : (
          <img
            src={imageUrl}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        )}

        {/* Satılık / Kiralık ve Tür Etiketleri */}
        <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex flex-wrap gap-1.5 sm:gap-2 max-w-[92%]">
          <Badge>
            {property.listing_type === "SALE" ? "Satılık" : "Kiralık"}
          </Badge>

          {/* Tür Etiketi */}
          <Badge variant="dark">
            {property.property_type === "HOUSE" && "Konut"}
            {property.property_type === "LAND" && "Arsa"}
            {property.property_type === "COMMERCIAL" && "İşyeri"}
          </Badge>

          {isVideoCover && (
            <Badge variant="bronze">
              🎬 Video
            </Badge>
          )}
        </div>
      </div>

      {/* İçerik Bilgileri */}
      <div className="p-4 sm:p-5">
        <h3 className="font-display text-lg sm:text-xl font-bold text-novis-anthracite line-clamp-2">
          {property.title}
        </h3>

        <p className="mt-2 sm:mt-3 text-lg sm:text-xl font-bold text-novis-gold">
          {Number(property.price).toLocaleString("tr-TR")} TL
        </p>

        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-novis-brown">
          📍 {property.district} / {property.city}
        </p>

        {/* Koşullu Özellik Alanı */}
        <div className="mt-3 sm:mt-4 border-t border-gray-100 pt-3 sm:pt-4 text-xs sm:text-sm text-novis-brown">
          {property.property_type === "LAND" ? (
            <span className="font-semibold">
              {property.square_meters} m² Arsa
            </span>
          ) : (
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <span>{property.square_meters} m²</span>

              {property.rooms && (
                <>
                  <span>•</span>
                  <span>{property.rooms}</span>
                </>
              )}

              {property.floor !== null && property.floor !== undefined && (
                <>
                  <span>•</span>
                  <span>{property.floor}. Kat</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Detay Butonu */}
        <Link to={`/ilan/${property.id}`} className="mt-4 sm:mt-5 block">
          <Button variant="secondary" className="w-full text-xs sm:text-sm py-2.5">
            Detayları Gör →
          </Button>
        </Link>
      </div>
    </article>
  );
}

export default PropertyCard;
