import { useState, useEffect } from 'react';
import api from '../services/api';

export default function CobrancaModal({ chargeId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/api/payments/charges/${chargeId}/second-copy`);
        if (active) setData(res.data);
      } catch (err) {
        if (active) setError(err.response?.data?.error || 'Erro ao carregar cobrança.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [chargeId]);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-spotnicik-primary">Cobrança Pendente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-4 border-spotnicik-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-spotnicik-dark">Carregando cobrança...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
        )}

        {data && (
          <div>
            <div className="bg-spotnicik-light p-4 rounded-lg mb-4 text-sm">
              <p className="text-spotnicik-dark"><strong>Valor:</strong> R$ {Number(data.value).toFixed(2)}</p>
              {data.description && (
                <p className="text-spotnicik-dark"><strong>Descrição:</strong> {data.description}</p>
              )}
              {data.due_date && (
                <p className="text-spotnicik-dark">
                  <strong>Vencimento:</strong> {new Date(data.due_date).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* PIX */}
            {data.billing_type === 'PIX' && (
              <div className="text-center">
                {data.pix_qr_code && (
                  <img
                    src={`data:image/png;base64,${data.pix_qr_code}`}
                    alt="QR Code PIX"
                    className="w-44 h-44 mx-auto mb-3"
                  />
                )}
                {data.pix_copy && (
                  <>
                    <code className="text-xs bg-spotnicik-light p-3 rounded block break-all mb-3">
                      {data.pix_copy}
                    </code>
                    <button
                      onClick={() => copy(data.pix_copy, 'pix')}
                      className="w-full bg-spotnicik-cyan text-spotnicik-dark py-2 rounded-lg font-medium hover:bg-cyan-400 transition"
                    >
                      {copied === 'pix' ? '✓ Copiado!' : 'Copiar código PIX'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* BOLETO */}
            {data.billing_type === 'BOLETO' && (
              <div>
                {data.boleto_url && (
                  <a
                    href={data.boleto_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-spotnicik-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition mb-3 text-center"
                  >
                    📄 Abrir / Imprimir Boleto (PDF)
                  </a>
                )}
                {data.boleto_line && (
                  <>
                    <p className="text-sm text-spotnicik-dark mb-2">Linha digitável:</p>
                    <code className="text-xs bg-spotnicik-light p-3 rounded block break-all mb-3">
                      {data.boleto_line}
                    </code>
                    <button
                      onClick={() => copy(data.boleto_line, 'boleto')}
                      className="w-full bg-spotnicik-cyan text-spotnicik-dark py-2 rounded-lg font-medium hover:bg-cyan-400 transition"
                    >
                      {copied === 'boleto' ? '✓ Copiado!' : 'Copiar linha digitável'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* CARTÃO */}
            {data.billing_type === 'CREDIT_CARD' && data.invoice_url && (
              <a
                href={data.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-spotnicik-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition text-center"
              >
                💳 Pagar com Cartão
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
