import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PasswordInput from './PasswordInput';

const WIFI_CTX_KEY = 'spotnick_wifi_ctx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Se existe um contexto de WiFi pendente (usuário veio do hotspot),
      // manda de volta para o portal em vez do dashboard.
      try {
        const raw = sessionStorage.getItem(WIFI_CTX_KEY);
        if (raw) {
          const ctx = JSON.parse(raw);
          if (ctx?.linkLoginOnly) {
            navigate(
              `/wifi?location=${encodeURIComponent(ctx.location || '')}&link-login-only=${encodeURIComponent(ctx.linkLoginOnly || '')}&link-orig=${encodeURIComponent(ctx.linkOrig || '')}&mac=${encodeURIComponent(ctx.mac || '')}`
            );
            return;
          }
        }
      } catch { /* ignora e segue fluxo normal */ }

      navigate('/dashboard');
    }
  };

  // Detecta se o erro é de email não verificado, para mostrar o link de reenvio
  const emailNotVerified = error && error.toLowerCase().includes('verific');

  return (
    <div className="min-h-screen bg-spotnicik-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-spotnicik-primary">SpotNICK</h1>
          <p className="text-spotnicik-dark mt-2">Wi-Fi Zone</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
            {emailNotVerified && (
              <div className="mt-2 space-y-1">
                <div>
                  <Link to="/resend-verification" className="text-spotnicik-primary font-medium underline">
                    Reenviar e-mail de verificação
                  </Link>
                </div>
                <div>
                  <Link to={`/verify-sms?email=${encodeURIComponent(email)}`} className="text-spotnicik-primary font-medium underline">
                    Ou verificar por código SMS
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-spotnicik-dark">
                Senha
              </label>
              <Link to="/forgot-password" className="text-xs text-spotnicik-cyan hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotnicik-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-spotnicik-dark">
            Não tem conta?{' '}
            <Link to="/register" className="text-spotnicik-cyan font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
          <p className="text-spotnicik-dark text-sm">
            Não recebeu o e-mail de verificação?{' '}
            <Link to="/resend-verification" className="text-spotnicik-cyan font-medium hover:underline">
              Reenviar
            </Link>
          </p>
          <p className="text-spotnicik-dark text-sm">
            Cadastrou-se com SMS e não verificou?{' '}
            <Link to="/verify-sms" className="text-spotnicik-cyan font-medium hover:underline">
              Verificar código
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
