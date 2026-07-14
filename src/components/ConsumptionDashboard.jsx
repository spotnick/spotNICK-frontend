import { useEffect, useState } from 'react'
import api from '../services/api'

const PERIODS = [
  { days: 7, label: '7 dias' },
  { days: 30, label: '30 dias' },
  { days: 90, label: '90 dias' },
]

function formatGb(gb) {
  if (gb >= 1) return `${gb.toFixed(2)} GB`
  return `${Math.round(gb * 1024)} MB`
}

export default function ConsumptionDashboard() {
  const [days, setDays] = useState(7)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api.get(`/api/admin/consumption-stats?days=${days}`)
      .then(({ data }) => { if (!cancelled) setStats(data) })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error || err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [days])

  const maxDayGb = stats?.byDay?.length
    ? Math.max(...stats.byDay.map((d) => d.gb), 0.001)
    : 1

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Cabeçalho + seletor de período */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Consumo de Dados</h1>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                days === p.days
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-500">Carregando…</p>}
      {error && <p className="text-red-600">Erro ao carregar: {error}</p>}

      {stats && !loading && (
        <>
          {/* Cards de totais */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Consumo total" value={formatGb(stats.totals.totalGb)} />
            <StatCard label="Sessões" value={stats.totals.sessions} />
            <StatCard label="Ativas agora" value={stats.totals.activeSessions} highlight />
            <StatCard label="Usuários únicos" value={stats.totals.uniqueUsers} />
            <StatCard label="Horas conectadas" value={`${stats.totals.totalHours} h`} />
          </div>

          {/* Gráfico de barras por dia */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Consumo por dia (GB)
            </h2>
            {stats.byDay.length === 0 ? (
              <p className="text-gray-400 text-sm">Sem dados no período.</p>
            ) : (
              <div className="flex items-end gap-1 h-40">
                {stats.byDay.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-full max-w-[40px] bg-blue-500 rounded-t group-hover:bg-blue-600 transition-colors"
                        style={{ height: `${Math.max((d.gb / maxDayGb) * 130, 3)}px` }}
                        title={`${d.day}: ${formatGb(d.gb)} · ${d.sessions} sessões`}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 rotate-0">
                      {d.day.slice(8, 10)}/{d.day.slice(5, 7)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Tabela por localização */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <h2 className="text-sm font-semibold text-gray-700 px-5 pt-5 pb-3">
              Por localização
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-2 font-medium">Localização</th>
                  <th className="px-5 py-2 font-medium text-right">Consumo</th>
                  <th className="px-5 py-2 font-medium text-right">Sessões</th>
                  <th className="px-5 py-2 font-medium text-right">Usuários</th>
                  <th className="px-5 py-2 font-medium text-right">Horas</th>
                </tr>
              </thead>
              <tbody>
                {stats.byLocation.map((loc) => (
                  <tr key={loc.locationId || 'none'} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{loc.name}</td>
                    <td className="px-5 py-3 text-right">{formatGb(loc.totalGb)}</td>
                    <td className="px-5 py-3 text-right">{loc.sessions}</td>
                    <td className="px-5 py-3 text-right">{loc.uniqueUsers}</td>
                    <td className="px-5 py-3 text-right">{loc.totalHours} h</td>
                  </tr>
                ))}
                {stats.byLocation.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-gray-400">
                      Sem dados no período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border p-4 ${
      highlight ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
    }`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}