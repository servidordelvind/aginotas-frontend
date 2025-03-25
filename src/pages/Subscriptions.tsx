import React, { useState, useEffect } from 'react';
import { Receipt, AlertCircle, XCircle, FileText } from 'lucide-react';
import { api } from '../lib/api';

interface Subscription {
  id: string; 
  billing_day: number;
  card: {
    brand: string;
    exp_month: number;
    exp_year: number;
    first_six_digits: string;
    holder_name: string;
    last_four_digits: string;
    status: string;
    type: string;
  },
  items: {
    name: string;
    description: string;
    pricing_scheme: {
      price: number;
    },
    status: string;
  }[], 
  status: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export function Subscriptions() {
  const [showInvoices, setShowInvoices] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) throw new Error("Usuário não encontrado");
      
      const userConvertido = JSON.parse(user);
      if (!userConvertido.subscription_id) throw new Error("ID de assinatura não encontrado");

      const response = await api.find_subscription(userConvertido.subscription_id);

      const subscriptionsData = Array.isArray(response) ? response : [response];
      setSubscriptions(subscriptionsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    //fetchInvoices();
  }, []);

/*   const fetchInvoices = async () => {
    // Simulando faturas para o histórico
    const response = [
      {
        id: '1',
        date: '2024-02-01',
        amount: 49.90,
        status: 'paid'
      },
      {
        id: '2',
        date: '2024-01-01',
        amount: 49.90,
        status: 'pending'
      }
    ];
    setInvoices(response);
  };

  const handleCancelSubscription = async (id: string) => {
    // Lógica para cancelar assinatura no backend
    setSubscriptions(subscriptions.map(sub => sub.id === id ? { ...sub, status: 'cancelled' } : sub));
  }; */
  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (subscriptions.length === 0) return <div>Nenhuma assinatura encontrada</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>

      {subscriptions.map((subscription) => (
        <div className="bg-white rounded-xl shadow-sm p-6" key={subscription.id}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {subscription.items[0]?.name || 'Assinatura'}
              </h2>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {`R$ ${subscription.items[0]?.pricing_scheme.price.toFixed(2) || '0,00'}`}
                </span>
                <span className="text-gray-500">/mês</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Receipt className="w-5 h-5" />
                  <span>Notas Fiscais Ilimitadas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>Cobrança realizada no dia {subscription.billing_day} de cada mês</span>
                </div>
              </div>
            </div> 
          </div>
        </div>
        ))}
      {/* Histórico de Faturas */}
      
{/*       <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Histórico de Faturas</h2>
          <button
            onClick={() => setShowInvoices(!showInvoices)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {showInvoices ? 'Ocultar Histórico' : 'Ver Histórico'}
          </button>
        </div>

        {showInvoices && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Nota Fiscal</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-gray-100">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(invoice.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(invoice.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert('Baixar PDF da fatura')}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Baixar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div> */}
    </div>
  );
}
