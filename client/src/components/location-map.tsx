import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import type { Location } from "@shared/schema";

// Fix for default markers in React Leaflet
// The library sometimes has issues loading marker icons, so we fix them manually
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons for different types of markers
const currentLocationIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "current-location-marker",
});

const savedLocationIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
  className: "saved-location-marker",
});

interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface LocationMapProps {
  currentLocation: CurrentLocation | null;
  savedLocations: Location[];
}

// Component to handle map view updates when location changes
function MapViewController({ currentLocation }: { currentLocation: CurrentLocation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (currentLocation) {
      // Smoothly pan and zoom to the new location
      map.setView([currentLocation.latitude, currentLocation.longitude], 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [currentLocation, map]);
  
  return null;
}

export default function LocationMap({ currentLocation, savedLocations }: LocationMapProps) {
  // Default map center (India) - closer to your actual location
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 5;

  // Determine map center and zoom based on available locations
  const mapCenter: [number, number] = currentLocation 
    ? [currentLocation.latitude, currentLocation.longitude]
    : defaultCenter;
  
  const mapZoom = currentLocation ? 15 : defaultZoom;

  // Add custom CSS for marker styling
  useEffect(() => {
    // Add custom styles for our markers
    const style = document.createElement("style");
    style.textContent = `
      .current-location-marker {
        filter: hue-rotate(120deg) brightness(1.2);
      }
      .saved-location-marker {
        filter: hue-rotate(240deg) brightness(0.9);
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Component to handle automatic map view updates */}
        <MapViewController currentLocation={currentLocation} />
        
        {/* Base map tiles from OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Current location marker */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={currentLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-medium text-sm mb-2">Your Current Location</h3>
                <div className="text-xs space-y-1">
                  <div>📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</div>
                  <div>🎯 Accuracy: ±{Math.round(currentLocation.accuracy)}m</div>
                  <div>🕒 {currentLocation.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Saved locations markers */}
        {savedLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={savedLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-medium text-sm mb-2">{location.name}</h3>
                <div className="text-xs space-y-1">
                  <div>📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</div>
                  {location.accuracy && (
                    <div>🎯 Accuracy: ±{Math.round(location.accuracy)}m</div>
                  )}
                  <div>🕒 {new Date(location.timestamp).toLocaleString()}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map controls overlay */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <div className="px-3 py-1 text-xs bg-gray-100 rounded">
            🌍 Interactive Map
          </div>
          {currentLocation && (
            <div className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded">
              Current Location
            </div>
          )}
          {savedLocations.length > 0 && (
            <div className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {savedLocations.length} Saved
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Zoom with mouse wheel • Click markers for details
        </div>
      </div>
    </div>
  );
}
