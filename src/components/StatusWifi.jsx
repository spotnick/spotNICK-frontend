import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

// Formata bytes crus (ex: 340672) para "332.9 KB"
function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function StatusWifi() {
  const [searchParams] = useSearchParams();

  const username = searchParams.get('username') || '';
  const ip = searchParams.get('ip') || '';
  const bytesIn = searchParams.get('bytes-in') || '0';
  const bytesOut = searchParams.get('bytes-out') || '0';
  const sessionTimeLeft = searchParams.get('session-time-left') || '';
  const uptime = searchParams.get('uptime') || '';
  const logoutUrl = searchParams.get('logout') || '';

  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoadingPlan(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/api/portal/active-plan', {
          params: { email: username },
        });
        setPlan(data.found ? data : null);
      } catch {
        setPlan(null);
      } finally {
        setLoadingPlan(false);
      }
    })();
  }, [username]);

  const handleNavigate = () => {
    // Redireciona para um site — o usuário já está liberado para navegar
    window.location.href = 'https://spotnick.app.br';
  };

  const handleLogout = () => {
    if (logoutUrl) {
      window.location.href = logoutUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotnicik-primary to-spotnicik-dark flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Cabeçalho com identidade SpotNICK */}
        <div className="bg-spotnicik-primary px-6 py-5 text-center">
          <h1 className="text-2xl font-bold text-white">SpotNICK</h1>
          <p className="text-blue-100 text-sm mt-0.5">Você está conectado! 🎉</p>
        </div>

        <div className="px-6 py-6">
          {username && (
            <p className="text-center text-spotnicik-dark mb-5">
              Olá, <strong>{username}</strong>!
            </p>
          )}

          {/* Dados da sessão atual */}
          <div className="bg-spotnicik-light rounded-xl p-4 mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Sessão atual</h2>
            <div className="space-y-2 text-sm">
              {ip && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Endereço IP</span>
                  <span className="text-spotnicik-dark font-medium">{ip}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Download / Upload</span>
                <span className="text-spotnicik-dark font-medium">
                  {formatBytes(bytesOut)} / {formatBytes(bytesIn)}
                </span>
              </div>
              {uptime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tempo conectado</span>
                  <span className="text-spotnicik-dark font-medium">{uptime}</span>
                </div>
              )}
              {sessionTimeLeft && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tempo restante</span>
                  <span className="text-spotnicik-dark font-medium">{sessionTimeLeft}</span>
                </div>
              )}
            </div>
          </div>

          {/* Plano / pacotes ativos */}
          {loadingPlan ? (
            <div className="text-center py-3">
              <div className="w-6 h-6 border-2 border-spotnicik-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : plan ? (
            <div className="bg-spotnicik-light rounded-xl p-4 mb-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Seu saldo (aproximado)</h2>
              <div className="space-y-3 text-sm">
                {plan.hours.bought > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Horas de acesso</span>
                      <span className="text-spotnicik-primary font-bold">
                        ~{plan.hours.remaining}h restantes
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {plan.hours.bought}h compradas · {plan.hours.used}h usadas
                    </div>
                  </div>
                )}
                {plan.data_gb.bought > 0 && (
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Dados extras</span>
                      <span className="text-spotnicik-primary font-bold">
                        ~{plan.data_gb.remaining} GB restantes
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {plan.data_gb.bought} GB comprados · {plan.data_gb.used} GB usados
                    </div>
                  </div>
                )}
                {plan.hours.bought === 0 && plan.data_gb.bought === 0 && (
                  <p className="text-gray-500 text-center">Nenhum pacote ativo no momento.</p>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-3 text-center">
                * Valores aproximados, podem levar alguns minutos para atualizar.
              </p>
            </div>
          ) : null}

          {/* Ações */}
          <button
            onClick={handleNavigate}
            className="w-full bg-spotnicik-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mb-3"
          >
            🌐 Navegar na internet
          </button>

          {logoutUrl && (
            <button
              onClick={handleLogout}
              className="w-full bg-white border border-gray-300 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Desconectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
