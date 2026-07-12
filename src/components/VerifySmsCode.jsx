import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function VerifySmsCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Contador regressivo do cooldown de reenvio
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/api/auth/verify-sms-code', { email, code });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível verificar o código.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await api.post('/api/auth/send-sms-code', { email });
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Não foi possível reenviar o código.');
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-spotnicik-light flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <p className="text-spotnicik-dark">
            Sessão de verificação não encontrada. Volte para o cadastro.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-spotnicik-light flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">✅</div>
          <h1 className="text-xl font-bold text-spotnicik-primary mb-2">Conta verificada!</h1>
          <p className="text-gray-600 text-sm">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotnicik-light flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-spotnicik-primary">Verifique seu celular</h1>
          <p className="text-gray-500 text-sm mt-2">
            Enviamos um código de 6 dígitos por SMS para o número cadastrado.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Código de verificação
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
              placeholder="000000"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-spotnicik-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="text-sm text-spotnicik-cyan hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {cooldown > 0
              ? `Reenviar código (${cooldown}s)`
              : resending
              ? 'Reenviando...'
              : 'Reenviar código'}
          </button>
        </div>
      </div>
    </div>
  );
}
