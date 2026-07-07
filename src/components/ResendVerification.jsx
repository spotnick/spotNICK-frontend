import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/api/auth/resend-verification', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao reenviar e-mail de verificação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spotnicik-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-spotnicik-primary">SpotNICK</h1>
          <p className="text-spotnicik-dark mt-2">Reenviar Verificação</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
              Se este e-mail estiver cadastrado e ainda não verificado, você receberá um novo link de verificação em instantes.
            </div>
            <Link to="/login" className="text-spotnicik-cyan font-medium hover:underline">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-spotnicik-dark text-sm mb-6">
              Não recebeu o e-mail de verificação ou o link expirou? Digite seu e-mail para receber um novo.
            </p>

            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                {error}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-spotnicik-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Enviando...' : 'Reenviar link de verificação'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-spotnicik-cyan font-medium hover:underline">
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
