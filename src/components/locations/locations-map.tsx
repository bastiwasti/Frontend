'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '@/types';
import 'leaflet/dist/leaflet.css';

const CATEGORY_COLORS: Record<string, string> = {
  playground: '#f97316',
  park: '#22c55e',
  garden: '#10b981',
  museum: '#8b5cf6',
  pool: '#3b82f6',
  sport: '#ef4444',
  indoor_playground: '#f59e0b',
};

function makeIcon(category: string) {
  const color = CATEGORY_COLORS[category] ?? '#6b7280';
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

interface LocationsMapProps {
  locations: Location[];
}

export default function LocationsMap({ locations }: LocationsMapProps) {
  const center: [number, number] = [51.09, 6.89]; // Monheim am Rhein area

  return (
    <MapContainer
      center={center}
      zoom={10}
      className="h-full w-full rounded-lg"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.latitude, loc.longitude]}
          icon={makeIcon(loc.category)}
        >
          <Popup>
            <div className="min-w-48">
              <h3 className="font-semibold text-sm mb-1">{loc.name}</h3>
              <p className="text-xs text-gray-500 capitalize mb-1">{loc.category}{loc.subcategory ? ` / ${loc.subcategory}` : ''}</p>
              {loc.city && <p className="text-xs text-gray-600">{loc.address ? `${loc.address}, ` : ''}{loc.city}{loc.postal_code ? ` ${loc.postal_code}` : ''}</p>}
              {loc.distance_km != null && <p className="text-xs text-gray-500 mt-1">{loc.distance_km.toFixed(1)} km away</p>}
              {loc.opening_hours && <p className="text-xs text-gray-500 mt-1">{loc.opening_hours}</p>}
              {loc.rating != null && <p className="text-xs text-gray-500 mt-1">Rating: {loc.rating}</p>}
              {loc.website_url && (
                <a href={loc.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                  Website
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
