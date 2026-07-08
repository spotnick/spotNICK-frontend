import { useState, useEffect } from 'react';
import api from '../services/api';
import CobrancaModal from './CobrancaModal';

const STATUS_INFO = {
  PENDING:   { label: 'Pendente',  classes: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Paga',      classes: 'bg-green-100 text-green-800' },
  RECEIVED:  { label: 'Paga',      classes: 'bg-green-100 text-green-800' },
  OVERDUE:   { label: 'Vencida',   classes: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelada', classes: 'bg-gray-100 text-gray-600' },
};

const BILLING_LABEL = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão',
};

export default function Historico() {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [cancelling, setCancelling] = useState(null); // id em cancelamento
  const [confirmCancel, setConfirmCancel] = useState(null); // charge aguardando confirmação

  const loadCharges = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/payments/charges', {
        params: { limit: 50 },
      });
      setCharges(data.charges || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
  }, []);

  const handleCancel = async (chargeId) => {
    setCancelling(chargeId);
    setConfirmCancel(null);
    try {
      await api.delete(`/api/payments/charges/${chargeId}/cancel`);
      await loadCharges();
    } catch (err) {
      alert('Erro ao cancelar: ' + (err.response?.data?.error || err.message));
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-spotnicik-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-spotnicik-dark">Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-spotnicik-primary">Histórico de Compras</h2>
        <button
          onClick={loadCharges}
          className="text-sm text-spotnicik-cyan hover:underline"
        >
          Atualizar
        </button>
      </div>

      {charges.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-spotnicik-dark">
          Você ainda não tem compras registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {charges.map((charge) => {
            const statusInfo = STATUS_INFO[charge.status] || {
              label: charge.status,
              classes: 'bg-gray-100 text-gray-600',
            };
            const isPending = charge.status === 'PENDING' || charge.status === 'OVERDUE';

            return (
              <div
                key={charge.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.classes}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {BILLING_LABEL[charge.billing_type] || charge.billing_type}
                      </span>
                    </div>
                    <p className="text-spotnicik-dark font-medium">
                      {charge.description || 'Compra SpotNICK'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(charge.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <span className="text-lg font-bold text-spotnicik-primary">
                      R$ {Number(charge.value).toFixed(2)}
                    </span>
                    {isPending && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCharge(charge.id)}
                          className="bg-spotnicik-primary text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition whitespace-nowrap"
                        >
                          Ver cobrança
                        </button>
                        <button
                          onClick={() => setConfirmCancel(charge)}
                          disabled={cancelling === charge.id}
                          className="bg-white border border-red-400 text-red-600 text-sm px-4 py-2 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition whitespace-nowrap"
                        >
                          {cancelling === charge.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCharge && (
        <CobrancaModal
          chargeId={selectedCharge}
          onClose={() => {
            setSelectedCharge(null);
            loadCharges();
          }}
        />
      )}

      {/* Diálogo de confirmação de cancelamento */}
      {confirmCancel && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50"
          onClick={() => setConfirmCancel(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-spotnicik-dark mb-2">Cancelar cobrança?</h3>
            <p className="text-sm text-spotnicik-dark mb-1">
              {confirmCancel.description || 'Compra SpotNICK'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Valor: R$ {Number(confirmCancel.value).toFixed(2)}
            </p>
            <p className="text-sm text-red-600 mb-6">
              Esta ação não pode ser desfeita. A cobrança será cancelada e não poderá mais ser paga.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(null)}
                className="flex-1 bg-gray-200 text-spotnicik-dark py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Voltar
              </button>
              <button
                onClick={() => handleCancel(confirmCancel.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition"
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
