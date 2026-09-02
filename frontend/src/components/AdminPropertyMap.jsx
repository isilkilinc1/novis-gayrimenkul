import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_LATITUDE = 37.8746;
const DEFAULT_LONGITUDE = 32.4932;

/* ==================================================
   HARİTAYI DIŞARIDAN GELEN KOORDİNATA GÖTÜR
================================================== */

function MapCenterController({ latitude, longitude }) {
  const map = useMap();

  const lastPosition = useRef(null);

  useEffect(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return;
    }

    /*
     * Aynı koordinat için tekrar tekrar
     * setView çalıştırma.
     */
    const positionKey = `${lat.toFixed(7)},${lng.toFixed(7)}`;

    if (lastPosition.current === positionKey) {
      return;
    }

    const currentCenter = map.getCenter();

    const distance =
      Math.abs(currentCenter.lat - lat) + Math.abs(currentCenter.lng - lng);

    /*
     * Harita zaten bu noktaya yakınsa
     * tekrar hareket ettirme.
     */
    if (distance < 0.00001) {
      lastPosition.current = positionKey;
      return;
    }

    lastPosition.current = positionKey;

    map.setView([lat, lng], map.getZoom(), {
      animate: false,
    });
  }, [latitude, longitude, map]);

  return null;
}

/* ==================================================
   HARİTAYA TIKLAMA
================================================== */

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

/* ==================================================
   SÜRÜKLENEBİLİR MARKER
================================================== */

function DraggableMarker({ latitude, longitude, onLocationSelect }) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return (
    <Marker
      position={[lat, lng]}
      draggable={true}
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target;
          const newPosition = marker.getLatLng();

          onLocationSelect(newPosition.lat, newPosition.lng);
        },
      }}
    >
      <Popup>
        <div className="text-xs">
          <strong>NOVIS Konumu</strong>

          <p className="mt-1 text-gray-500">
            Konumu değiştirmek için marker'ı sürükleyebilir veya haritaya
            tıklayabilirsiniz.
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

/* ==================================================
   ANA COMPONENT
================================================== */

function AdminPropertyMap({
  latitude,
  longitude,
  city,
  district,
  neighborhood,
  address,
  onLocationSelect,
}) {
  const [searching, setSearching] = useState(false);
  const [reverseSearching, setReverseSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  /*
   * Haritadan seçilen konum sonrası
   * forward geocoding'in tekrar çalışmasını
   * engeller.
   */
  const skipNextForwardSearch = useRef(false);

  /*
   * Son forward arama.
   * Aynı adres için tekrar tekrar API çağrısı yapılmasını
   * engeller.
   */
  const lastForwardQuery = useRef("");

  /* ==================================================
     KOORDİNATLARI HESAPLA
  ================================================== */

  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  const currentLatitude = Number.isFinite(parsedLatitude)
    ? parsedLatitude
    : DEFAULT_LATITUDE;

  const currentLongitude = Number.isFinite(parsedLongitude)
    ? parsedLongitude
    : DEFAULT_LONGITUDE;

  /* ==================================================
     ŞEHİR / İLÇE / MAHALLE / ADRES
     → KOORDİNAT
  ================================================== */

  useEffect(() => {
    /*
     * Reverse geocoding'den geldiysek
     * tekrar forward geocoding yapma.
     */
    if (skipNextForwardSearch.current) {
      skipNextForwardSearch.current = false;
      return;
    }

    const cleanCity = city?.trim();

    if (!cleanCity) {
      return;
    }

    const cleanDistrict = district?.trim();
    const cleanNeighborhood = neighborhood?.trim();
    const cleanAddress = address?.trim();

    const parts = [
      cleanAddress,
      cleanNeighborhood,
      cleanDistrict,
      cleanCity,
      "Türkiye",
    ].filter(Boolean);

    const query = parts.join(", ");

    if (!query || query === lastForwardQuery.current) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchMessage("");

        lastForwardQuery.current = query;

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=tr&q=${encodeURIComponent(
            query,
          )}`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Konum servisine ulaşılamadı.");
        }

        const data = await response.json();

        if (data.length > 0) {
          const lat = Number(data[0].lat);
          const lng = Number(data[0].lon);

          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            onLocationSelect({
              latitude: lat,
              longitude: lng,
              updateAddress: false,
            });

            setSearchMessage("✓ Adrese göre harita konumu güncellendi.");
          }
        } else {
          setSearchMessage(
            "Bu adres için otomatik konum bulunamadı. Haritadan manuel seçebilirsiniz.",
          );
        }
      } catch (error) {
        console.error("Konum arama hatası:", error);

        setSearchMessage(
          "Otomatik konum bulunamadı. Haritadan manuel seçebilirsiniz.",
        );
      } finally {
        setSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [city, district, neighborhood, address, onLocationSelect]);

  /* ==================================================
     REVERSE GEOCODING

     KOORDİNAT
     →
     ŞEHİR
     →
     İLÇE
     →
     MAHALLE
     →
     ADRES
  ================================================== */

  const reverseGeocode = async (lat, lng) => {
    try {
      setReverseSearching(true);
      setSearchMessage("📍 Seçilen konumun adresi bulunuyor...");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=tr`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Adres servisine ulaşılamadı.");
      }

      const data = await response.json();

      if (!data || !data.address) {
        setSearchMessage("Konum seçildi fakat adres bilgisi bulunamadı.");
        return;
      }

      const addressData = data.address;

      const cityName =
        addressData.province ||
        addressData.state ||
        addressData.city ||
        addressData.town ||
        "";

      const districtName =
        addressData.district ||
        addressData.town ||
        addressData.municipality ||
        addressData.county ||
        addressData.city_district ||
        "";

      const neighborhoodName =
        addressData.neighbourhood ||
        addressData.suburb ||
        addressData.quarter ||
        addressData.village ||
        "";

      const road =
        addressData.road ||
        addressData.pedestrian ||
        addressData.residential ||
        "";

      const houseNumber = addressData.house_number || "";

      let fullAddress = "";

      if (road && houseNumber) {
        fullAddress = `${road} No: ${houseNumber}`;
      } else if (road) {
        fullAddress = road;
      } else {
        fullAddress = data.display_name || "";
      }

      /*
       * Bir sonraki forward aramayı atla.
       */
      skipNextForwardSearch.current = true;

      /*
       * Adres + şehir + ilçe + mahalle
       * forma gönderiliyor.
       */
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        city: cityName,
        district: districtName,
        neighborhood: neighborhoodName,
        address: fullAddress,
        updateAddress: true,
      });

      setSearchMessage(
        "✓ Konum ve adres bilgileri otomatik olarak dolduruldu.",
      );
    } catch (error) {
      console.error("Adres bulma hatası:", error);

      setSearchMessage(
        "Konum seçildi fakat adres bilgileri otomatik bulunamadı.",
      );
    } finally {
      setReverseSearching(false);
    }
  };

  /* ==================================================
     KONUM SEÇİMİ
  ================================================== */

  const handleLocationSelect = async (lat, lng) => {
    /*
     * Önce marker'ı yeni koordinata götür.
     */
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      updateAddress: false,
    });

    /*
     * Sonra adresi bul.
     */
    await reverseGeocode(lat, lng);
  };

  /* ==================================================
     RENDER
  ================================================== */

  return (
    <div className="space-y-3">
      {/* BAŞLIK */}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-novis-anthracite">
            📍 Gayrimenkul Konumu
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Şehir ve adres bilgisine göre harita otomatik konumlandırılır.
            Haritaya tıklayarak veya marker'ı sürükleyerek konumu manuel
            seçebilirsiniz.
          </p>
        </div>

        {(searching || reverseSearching) && (
          <span className="text-xs text-novis-bronze font-medium whitespace-nowrap">
            {reverseSearching ? "Adres bulunuyor..." : "Konum aranıyor..."}
          </span>
        )}
      </div>

      {/* HARİTA */}

      <div className="w-full h-96 rounded-xl overflow-hidden border border-novis-bronze/30 shadow-sm relative z-0 isolate">
        <MapContainer
          center={[currentLatitude, currentLongitude]}
          zoom={14}
          scrollWheelZoom={true}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapCenterController
            latitude={currentLatitude}
            longitude={currentLongitude}
          />

          <MapClickHandler onLocationSelect={handleLocationSelect} />

          <DraggableMarker
            latitude={currentLatitude}
            longitude={currentLongitude}
            onLocationSelect={handleLocationSelect}
          />
        </MapContainer>

        {/* KONUM MESAJI */}
        {searchMessage && (
          <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
            <div className="inline-block max-w-full rounded-lg bg-white/95 backdrop-blur-sm border border-novis-bronze/20 shadow-md px-3 py-2 text-xs text-novis-brown">
              {searchMessage}
            </div>
          </div>
        )}
      </div>

      {/* KOORDİNATLAR */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
          <span className="block text-[11px] text-gray-500">
            Enlem (Latitude)
          </span>

          <span className="text-sm font-semibold text-novis-anthracite">
            {currentLatitude.toFixed(6)}
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
          <span className="block text-[11px] text-gray-500">
            Boylam (Longitude)
          </span>

          <span className="text-sm font-semibold text-novis-anthracite">
            {currentLongitude.toFixed(6)}
          </span>
        </div>
      </div>

      {/* BİLGİ */}

      <div className="rounded-lg bg-novis-cream/30 border border-novis-bronze/20 px-3 py-2">
        <p className="text-xs text-novis-brown">
          💡 <strong>Kullanım:</strong> Şehir ve ilçe bilgilerini girdiğinizde
          harita otomatik olarak konuma gider. Daha sonra haritaya tıklayabilir
          veya marker'ı sürükleyebilirsiniz. Seçilen konumun şehir, ilçe,
          mahalle ve adres bilgileri otomatik olarak forma aktarılır.
        </p>
      </div>
    </div>
  );
}

export default AdminPropertyMap;
