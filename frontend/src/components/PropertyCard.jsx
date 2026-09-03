import { Link } from "react-router-dom";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

function PropertyCard({ property }) {
  // İlanın gerçek kapak fotoğrafı varsa onu kullan.
  // Fotoğraf yoksa gayrimenkul türüne göre özel placeholder göster.
  let imageUrl;

  if (property.cover_image) {
    imageUrl = `http://localhost:5000${property.cover_image}`;
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

  return (
    <article className="overflow-hidden rounded-2xl border border-novis-bronze/20 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Fotoğraf Alanı */}
      <div className="relative h-56 bg-novis-bronze/10">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover"
        />

        {/* Satılık / Kiralık Etiketi */}
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge>
            {property.listing_type === "SALE" ? "Satılık" : "Kiralık"}
          </Badge>

          {/* Tür Etiketi */}
          <Badge variant="dark">
            {property.property_type === "HOUSE" && "Konut"}
            {property.property_type === "LAND" && "Arsa"}
            {property.property_type === "COMMERCIAL" && "İşyeri"}
          </Badge>
        </div>
      </div>

      {/* İçerik Bilgileri */}
      <div className="p-5">
        <h3 className="font-display text-xl font-bold text-novis-anthracite">
          {property.title}
        </h3>

        <p className="mt-3 text-xl font-bold text-novis-gold">
          {Number(property.price).toLocaleString("tr-TR")} TL
        </p>

        <p className="mt-2 text-sm text-novis-brown">
          📍 {property.district} / {property.city}
        </p>

        {/* Koşullu Özellik Alanı */}
        <div className="mt-4 border-t border-gray-100 pt-4 text-sm text-novis-brown">
          {property.property_type === "LAND" ? (
            <span className="font-semibold">
              {property.square_meters} m² Arsa
            </span>
          ) : (
            <div className="flex gap-3 flex-wrap">
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
        <Link to={`/ilan/${property.id}`} className="mt-5 block">
          <Button variant="secondary" className="w-full">
            Detayları Gör →
          </Button>
        </Link>
      </div>
    </article>
  );
}

export default PropertyCard;
