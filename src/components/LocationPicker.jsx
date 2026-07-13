import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige o ícone padrão do Leaflet (problema conhecido com bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [-25.0, -51.0]; // Centro aproximado do Paraná, como ponto de partida
const DEFAULT_ZOOM = 13;

// Componente interno: captura cliques no mapa
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ latitude, longitude, onChange }) {
  const [address, setAddress] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const hasPosition = latitude != null && longitude != null;
  const center = hasPosition ? [latitude, longitude] : DEFAULT_CENTER;

  const handleMapClick = useCallback(async (lat, lng) => {
    onChange({ latitude: lat, longitude: lng, address: null });
    // Busca o endereço correspondente ao ponto clicado (geocodificação reversa)
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
      const result = await res.json();
      if (result?.display_name) {
        onChange({ latitude: lat, longitude: lng, address: result.display_name });
      }
    } catch {
      // Se a busca reversa falhar, mantém só as coordenadas — não é crítico
    }
  }, [onChange]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!address.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR' },
      });
      const results = await res.json();
      if (results.length === 0) {
        setSearchError('Endereço não encontrado. Tente ser mais específico ou clique no mapa.');
        return;
      }
      const { lat, lon, display_name } = results[0];
      onChange({ latitude: parseFloat(lat), longitude: parseFloat(lon), address: display_name });
    } catch (err) {
      setSearchError('Erro ao buscar endereço. Tente clicar no mapa diretamente.');
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-spotnicik-dark mb-1">
        Localização
      </label>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite o endereço para buscar..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-spotnicik-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
        >
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {searchError && (
        <p className="text-red-600 text-xs mb-2">{searchError}</p>
      )}

      <p className="text-xs text-gray-500 mb-2">
        Ou clique diretamente no mapa para marcar o ponto exato.
      </p>

      <div className="rounded-lg overflow-hidden border border-gray-300" style={{ height: '300px' }}>
        <MapContainer
          center={center}
          zoom={hasPosition ? 16 : DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          key={hasPosition ? `${latitude}-${longitude}` : 'default'}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleMapClick} />
          {hasPosition && <Marker position={[latitude, longitude]} />}
        </MapContainer>
      </div>

      {hasPosition && (
        <p className="text-xs text-gray-500 mt-1">
          Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
