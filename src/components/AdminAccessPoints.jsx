import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const BRANDS = [
  { value: 'ubiquiti', label: 'Ubiquiti' },
  { value: 'cisco', label: 'Cisco' },
  { value: 'dlink', label: 'D-Link' },
  { value: 'tplink', label: 'TP-Link' },
  { value: 'huawei', label: 'Huawei' },
  { value: 'juniper', label: 'Juniper' },
  { value: 'hp', label: 'HP' },
  { value: 'mikrotik', label: 'Mikrotik' },
  { value: 'other', label: 'Outra' },
];

const BRAND_LABEL = Object.fromEntries(BRANDS.map((b) => [b.value, b.label]));

const STATUS_INFO = {
  online:  { label: 'Online',  classes: 'bg-green-100 text-green-700' },
  offline: { label: 'Offline', classes: 'bg-red-100 text-red-700' },
  unknown: { label: 'Desconhecido', classes: 'bg-gray-100 text-gray-600' },
};

const emptyForm = {
  location_id: '',
  name: '',
  brand: 'ubiquiti',
  model: '',
  serial_number: '',
  mac_address: '',
  ip_address: '',
  physical_location: '',
  radio_channel: '',
  ssid: '',
  notes: '',
};

export default function AdminAccessPoints() {
  const [aps, setAps] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/admin/locations');
        setLocations(data.locations || []);
      } catch { /* ignora */ }
    })();
  }, []);

  const loadAps = useCallback(async (locId) => {
    setLoading(true);
    setError(null);
    try {
      const params = locId ? { location_id: locId } : {};
      const { data } = await api.get('/api/admin/access-points', { params });
      setAps(data.access_points || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar access points.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAps(filterLocation);
  }, [loadAps, filterLocation]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, location_id: filterLocation || (locations[0]?.id || '') });
    setShowForm(true);
  };

  const openEdit = (ap) => {
    setEditing(ap);
    setForm({
      location_id: ap.location_id,
      name: ap.name || '',
      brand: ap.brand || 'ubiquiti',
      model: ap.model || '',
      serial_number: ap.serial_number || '',
      mac_address: ap.mac_address || '',
      ip_address: ap.ip_address || '',
      physical_location: ap.physical_location || '',
      radio_channel: ap.radio_channel || '',
      ssid: ap.ssid || '',
      notes: ap.notes || '',
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location_id) {
      alert('Selecione um local.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/api/admin/access-points/${editing.id}`, form);
      } else {
        await api.post('/api/admin/access-points', form);
      }
      setShowForm(false);
      await loadAps(filterLocation);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar access point.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ap) => {
    try {
      await api.patch(`/api/admin/access-points/${ap.id}`, { is_active: !ap.is_active });
      await loadAps(filterLocation);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar status.');
    }
  };

  const handleDelete = async (ap) => {
    if (!window.confirm(`Excluir o access point "${ap.name}"?`)) return;
    try {
      await api.delete(`/api/admin/access-points/${ap.id}`);
      await loadAps(filterLocation);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-spotnicik-primary">Access Points</h2>
        <div className="flex gap-2">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
          >
            <option value="">Todos os locais</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <button
            onClick={openCreate}
            disabled={locations.length === 0}
            className="bg-spotnicik-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap"
          >
            + Novo AP
          </button>
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-spotnicik-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : aps.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-spotnicik-dark">
          Nenhum access point cadastrado.
        </div>
      ) : (
        <div className="space-y-3">
          {aps.map((ap) => {
            const st = STATUS_INFO[ap.status] || STATUS_INFO.unknown;
            return (
              <div key={ap.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-spotnicik-dark">{ap.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.classes}`}>{st.label}</span>
                      {!ap.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inativo</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{BRAND_LABEL[ap.brand] || ap.brand}{ap.model ? ` · ${ap.model}` : ''}</span>
                      {ap.locations?.name && <span>📍 {ap.locations.name}</span>}
                      {ap.physical_location && <span>{ap.physical_location}</span>}
                      {ap.mac_address && <span>MAC: {ap.mac_address}</span>}
                      {ap.ip_address && <span>IP: {ap.ip_address}</span>}
                      {ap.ssid && <span>SSID: {ap.ssid}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(ap)}
                      className="text-sm px-3 py-1.5 bg-spotnicik-primary text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActive(ap)}
                      className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      {ap.is_active ? 'Bloquear' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => handleDelete(ap)}
                      className="text-sm px-3 py-1.5 border border-red-400 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50 py-8"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-spotnicik-primary mb-4">
              {editing ? 'Editar Access Point' : 'Novo Access Point'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-spotnicik-dark mb-1">Local *</label>
                <select
                  name="location_id"
                  value={form.location_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                  required
                >
                  <option value="">Selecione...</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">Nome *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                    placeholder="AP Recepção" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">Marca *</label>
                  <select name="brand" value={form.brand} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary">
                    {BRANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">Modelo</label>
                  <input name="model" value={form.model} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                    placeholder="UAP-AC-Pro" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">Nº de Série</label>
                  <input name="serial_number" value={form.serial_number} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">MAC Address</label>
                  <input name="mac_address" value={form.mac_address} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                    placeholder="AA:BB:CC:DD:EE:FF" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">IP de Gestão</label>
                  <input name="ip_address" value={form.ip_address} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                    placeholder="192.168.1.10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-spotnicik-dark mb-1">Localização Física</label>
                <input name="physical_location" value={form.physical_location} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                  placeholder="2º andar, ala leste" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">Canal de Rádio</label>
                  <input name="radio_channel" value={form.radio_channel} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                    placeholder="6, 36, auto" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotnicik-dark mb-1">SSID</label>
                  <input name="ssid" value={form.ssid} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                    placeholder="SpotNICK-WiFi" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-spotnicik-dark mb-1">Observações</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-spotnicik-dark py-2 rounded-lg font-medium hover:bg-gray-300 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-spotnicik-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
