import { useState } from 'react';
import api from '../services/api';
import PasswordInput from './PasswordInput';

export default function Perfil({ user }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Senhas não conferem!' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/request-password-reset', {
        email: user?.email,
      });
      setMessage({
        type: 'success',
        text: 'Email de reset enviado! Verifique sua caixa de entrada.',
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Erro ao solicitar reset',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {/* Informacoes do Usuario */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-spotnicik-primary mb-6">Meus Dados</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Nome
            </label>
            <input
              type="text"
              value={user?.name || ''}
              disabled
              className="w-full px-4 py-2 bg-spotnicik-light text-spotnicik-dark rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 bg-spotnicik-light text-spotnicik-dark rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={user?.phone || 'N/A'}
              disabled
              className="w-full px-4 py-2 bg-spotnicik-light text-spotnicik-dark rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              CPF
            </label>
            <input
              type="text"
              value={user?.cpf || 'N/A'}
              disabled
              className="w-full px-4 py-2 bg-spotnicik-light text-spotnicik-dark rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Status
            </label>
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
              ✅ Verificado
            </div>
          </div>
        </div>
      </div>

      {/* Reset de Senha */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-spotnicik-primary mb-6">Segurança</h2>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Nova Senha
            </label>
            <PasswordInput
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-spotnicik-dark mt-1">
              Mínimo 8 caracteres, com números e caracteres especiais
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Confirmar Senha
            </label>
            <PasswordInput
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotnicik-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Enviando...' : 'Resetar Senha'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-spotnicik-light rounded-lg">
          <p className="text-xs text-spotnicik-dark">
            <strong>ℹ️ Dica:</strong> Você receberá um email com instruções para redefinir sua senha. O link expira em 1 hora.
          </p>
        </div>
      </div>
    </div>
  );
}
