import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet varsayılan ikon sorununu çözmek için küçük bir ayar
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertyMap({ latitude, longitude, title, address }) {
  // Eğer veritabanında koordinat girilmemişse varsayılan bir konum (Örn: Konya merkez) kullanalım
  const lat = latitude ? Number(latitude) : 37.8746;
  const lng = longitude ? Number(longitude) : 32.4932;

  return (
    <div className="w-full h-[300px] md:h-[350px] rounded-xl overflow-hidden border border-novis-bronze/20 shadow-xs z-10 relative">
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-xs font-medium text-novis-anthracite">
              <strong>{title || "NOVIS İlanı"}</strong>
              <p className="mt-1 text-gray-500">{address || "Konum bilgisi"}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
