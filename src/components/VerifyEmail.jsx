import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail() {
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado no link.');
      return;
    }

    verifyToken(token);
  }, []);

  const verifyToken = async (token) => {
    try {
      const { data } = await api.post('/api/auth/verify-email', { token });

      // Se o backend retornar tokens, já loga o usuário
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      setStatus('success');
      setMessage('E-mail verificado com sucesso!');

      // Redireciona após 3 segundos
      setTimeout(() => {
        navigate(data.accessToken ? '/dashboard' : '/login');
      }, 3000);
    } catch (err) {
      setStatus('error');
      setMessage(
        err.response?.data?.error || 'Erro ao verificar e-mail. O link pode ter expirado.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-spotnicik-light flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold text-spotnicik-primary mb-2">SpotNICK</h1>
        <p className="text-spotnicik-dark mb-8">Verificação de E-mail</p>

        {status === 'loading' && (
          <div>
            <div className="w-12 h-12 border-4 border-spotnicik-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-spotnicik-dark">Verificando seu e-mail...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
              {message}
            </div>
            <p className="text-spotnicik-dark text-sm">
              Redirecionando em instantes...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-6xl mb-4">❌</div>
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {message}
            </div>
            <Link
              to="/login"
              className="inline-block bg-spotnicik-primary text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Ir para Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
