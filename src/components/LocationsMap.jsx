import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33],
  className: 'user-location-marker',
});

const BILLING_LABELS = {
  free: '🟢 Grátis',
  paid: '💳 Pago',
  free_then_paid: '🟡 Grátis + Pago',
};

const DEFAULT_CENTER = [-25.0, -51.0];

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function LocationsMap() {
  const [locations, setLocations] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/public/locations-map');
        setLocations(data.locations || []);
      } catch (err) {
        setError('Não foi possível carregar os pontos de WiFi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('asking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { timeout: 10000 }
    );
  }, []);

  const locationsWithDistance = userPosition
    ? locations
        .map((loc) => ({
          ...loc,
          distance: distanceKm(userPosition[0], userPosition[1], loc.latitude, loc.longitude),
        }))
        .sort((a, b) => a.distance - b.distance)
    : locations;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-spotnicik-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md mx-auto">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-spotnicik-primary">Pontos SpotNICK próximos</h2>
        {geoStatus === 'denied' && (
          <p className="text-sm text-gray-500 mt-1">
            Permita o acesso à localização para ver os pontos mais próximos de você.
          </p>
        )}
      </div>

      <div className="rounded-lg overflow-hidden border border-gray-300 mb-4" style={{ height: '450px' }}>
        <MapContainer
          center={userPosition || DEFAULT_CENTER}
          zoom={userPosition ? 14 : 6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {userPosition && <RecenterMap position={userPosition} />}
          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Você está aqui</Popup>
            </Marker>
          )}
          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
              <Popup>
                <strong>{loc.name}</strong>
                <br />
                {BILLING_LABELS[loc.billing_mode] || loc.billing_mode}
                {loc.address && (
                  <>
                    <br />
                    <span className="text-xs">{loc.address}</span>
                  </>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="space-y-2">
        {locationsWithDistance.map((loc) => (
          <div key={loc.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-spotnicik-dark">{loc.name}</p>
              <p className="text-xs text-gray-500">
                {BILLING_LABELS[loc.billing_mode] || loc.billing_mode}
                {loc.address && ` · ${loc.address}`}
              </p>
            </div>
            {loc.distance != null && (
              <span className="text-sm text-spotnicik-primary font-medium whitespace-nowrap ml-3">
                {loc.distance < 1
                  ? `${Math.round(loc.distance * 1000)} m`
                  : `${loc.distance.toFixed(1)} km`}
              </span>
            )}
          </div>
        ))}
        {locationsWithDistance.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Nenhum ponto SpotNICK cadastrado ainda.
          </div>
        )}
      </div>
    </div>
  );
}
