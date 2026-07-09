import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminUsers from './AdminUsers';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spotnicik-light">
        <div className="w-10 h-10 border-4 border-spotnicik-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Proteção no frontend (o backend também protege de verdade).
  // Mostra o admin apenas para o dono. (Admins de local podem ser
  // liberados depois, quando tratarmos permissões por local.)
  const isAllowed = user && user.role === 'owner';

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spotnicik-light px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-spotnicik-dark mb-2">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">Esta área é exclusiva para administradores.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-spotnicik-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spotnicik-light">
      {/* Header do admin */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-spotnicik-primary">SpotNICK</h1>
            <span className="text-xs bg-spotnicik-dark text-white px-2 py-1 rounded">ADMIN</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-spotnicik-cyan hover:underline"
          >
            ← Voltar ao app
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AdminUsers />
      </main>
    </div>
  );
}
