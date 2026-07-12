import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isValidCPF, formatCPF } from '../utils/cpf';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });
  const [cpfError, setCpfError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cpf') {
      // Aplica a máscara enquanto digita
      const masked = formatCPF(value);
      setForm((prev) => ({ ...prev, cpf: masked }));
      // Valida apenas quando tiver 11 dígitos
      const digits = masked.replace(/\D/g, '');
      if (digits.length === 11) {
        setCpfError(isValidCPF(masked) ? '' : 'CPF inválido. Verifique os números.');
      } else {
        setCpfError('');
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidCPF(form.cpf)) {
      setCpfError('CPF inválido. Verifique os números.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert('Senhas não conferem!');
      return;
    }

    setLoading(true);
    const result = await register(
      form.name,
      form.email,
      form.phone,
      form.cpf.replace(/\D/g, ''),
      form.password
    );
    setLoading(false);

    if (result.success) {
      alert('Cadastro realizado! Verifique seu email para ativar a conta.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-spotnicik-light flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-spotnicik-primary">SpotNICK</h1>
          <p className="text-spotnicik-dark mt-2">Criar Conta</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
              placeholder="Seu Nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-spotnicik-dark mb-1">
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
                placeholder="11999999999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-spotnicik-dark mb-1">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  cpfError
                    ? 'border-red-400 focus:ring-red-400'
                    : 'border-gray-300 focus:ring-spotnicik-primary'
                }`}
                placeholder="123.456.789-01"
                maxLength={14}
                required
              />
            </div>
          </div>
          {cpfError && (
            <p className="text-red-600 text-xs -mt-2">{cpfError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-spotnicik-dark mt-1">
              Mínimo 8 caracteres, com ao menos um número e um caractere especial
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-spotnicik-dark mb-1">
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!cpfError}
            className="w-full bg-spotnicik-primary text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-spotnicik-dark">
            Já tem conta?{' '}
            <Link to="/login" className="text-spotnicik-cyan font-medium hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
