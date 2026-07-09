import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const formatCPF = (cpf) => {
  const c = String(cpf || '').replace(/\D/g, '');
  if (c.length !== 11) return cpf || '-';
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // id em operação
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const loadUsers = useCallback(async (searchTerm, off) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/admin/users', {
        params: { search: searchTerm, limit: LIMIT, offset: off },
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers('', 0);
  }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    loadUsers(search, 0);
  };

  const toggleBlock = async (user) => {
    setBusy(user.id);
    try {
      const action = user.is_blocked ? 'unblock' : 'block';
      await api.post(`/api/admin/users/${user.id}/${action}`);
      await loadUsers(search, offset);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao alterar status.');
    } finally {
      setBusy(null);
    }
  };

  const changePage = (newOffset) => {
    setOffset(newOffset);
    loadUsers(search, newOffset);
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('pt-BR') : '-';

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-spotnicik-primary mb-6">Gestão de Usuários</h2>

      {/* Busca */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, email, CPF ou telefone..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spotnicik-primary"
        />
        <button
          type="submit"
          className="bg-spotnicik-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Buscar
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-spotnicik-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-spotnicik-dark">Carregando...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-spotnicik-dark">
          Nenhum usuário encontrado.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-spotnicik-light">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-spotnicik-dark">Nome</th>
                    <th className="text-left px-4 py-3 font-semibold text-spotnicik-dark">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-spotnicik-dark">CPF</th>
                    <th className="text-left px-4 py-3 font-semibold text-spotnicik-dark">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-spotnicik-dark">Cadastro</th>
                    <th className="text-right px-4 py-3 font-semibold text-spotnicik-dark">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <div className="font-medium text-spotnicik-dark">{u.name}</div>
                        {u.role === 'owner' && (
                          <span className="text-xs bg-spotnicik-primary text-white px-2 py-0.5 rounded-full">Dono</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.email}
                        {!u.email_verified && (
                          <span className="ml-1 text-xs text-yellow-600">(não verif.)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatCPF(u.cpf)}</td>
                      <td className="px-4 py-3">
                        {u.is_blocked ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Bloqueado</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ativo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'owner' && (
                          <button
                            onClick={() => toggleBlock(u)}
                            disabled={busy === u.id}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 ${
                              u.is_blocked
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-white border border-red-400 text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {busy === u.id
                              ? '...'
                              : u.is_blocked
                              ? 'Desbloquear'
                              : 'Bloquear'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Mostrando {offset + 1}–{Math.min(offset + LIMIT, total)} de {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => changePage(Math.max(0, offset - LIMIT))}
                disabled={offset === 0}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Anterior
              </button>
              <button
                onClick={() => changePage(offset + LIMIT)}
                disabled={offset + LIMIT >= total}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Próximo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
