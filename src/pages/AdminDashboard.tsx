import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CircularProgress } from '@mui/material'; // Importe CircularProgress
import { api } from '../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function AdminDashboard() {

interface InvoiceByMonth {
  month: string;
  value: number;
}

interface CustomerByMonth {
  month: string;
  count: number;
}

interface SubscriptionByMonth {
  month: string;
  count: number;
}

interface Metrics {
  totalInvoices: number;
  totalInvoiceValue: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newSubscriptions: number;
  latecomers: number;
  subscriptionCancellations: number;
  totalSubscriptionRevenue: number;
  invoicesByMonth: InvoiceByMonth[];
  customersByMonth: CustomerByMonth[];
  subscriptionsByMonth: SubscriptionByMonth[];
}

const [metrics, setMetrics] = useState({
  totalInvoices: 0,
  totalInvoiceValue: 50000,
  activeCustomers: 120,
  inactiveCustomers: 30,
  newSubscriptions: 15,
  latecomers: 15,
  subscriptionCancellations: 5, // Exemplo de cancelamentos
  totalSubscriptionRevenue: 25000, // Exemplo de receita de assinaturas
  
  invoicesByMonth: [
    { month: 'Jan', value: 4000 },
    { month: 'Fev', value: 4500 },
    { month: 'Mar', value: 5000 },
    { month: 'Abr', value: 5500 },
    { month: 'Mai', value: 6000 },
    { month: 'Jun', value: 6500 },
  ],

  customersByMonth: [
    { month: 'Jan', count: 100 },
    { month: 'Fev', count: 105 },
    { month: 'Mar', count: 110 },
    { month: 'Abr', count: 115 },
    { month: 'Mai', count: 120 },
    { month: 'Jun', count: 125 },
  ],
  
  subscriptionsByMonth: [
    { month: 'Jan', count: 10 },
    { month: 'Fev', count: 12 },
    { month: 'Mar', count: 13 },
    { month: 'Abr', count: 14 },
    { month: 'Mai', count: 15 },
    { month: 'Jun', count: 16 },
  ],
});


const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [selectedChart, setSelectedChart] = useState('invoices');
const [invoice, setInvoice] = useState([]);
const [invoicePrice, setInvoicePrice] = useState(0);
const [users, setUsers] = useState([]);
const [plans, setPlans] = useState<Plan | null>(null);
const [subscriptions, setSubscriptions] = useState([]);

useEffect(() => {
  async function fetchMetrics() {
    try {
      const invoice = await api.find_all_invoices();
      setInvoice(invoice.filter((inv) => inv.status === 'emitida' || inv.status === 'substituida'));

      const totalPrice = invoice
        .filter((inv) => inv.status === 'emitida' || inv.status === 'substituida')
        .reduce((sum, inv) => sum + inv.valor, 0);

      setInvoicePrice(totalPrice);
      
      const usersdb = await api.find_all_users();
      setUsers(usersdb);

      const response = await api.find_plans();
      setPlans(response.data[0]);

      const subscriptions = await api.Find_All_Subscriptions();
      setSubscriptions(subscriptions.data);

    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  }
  fetchMetrics();
}, []);


  const dataInvoices = {
    labels: metrics.invoicesByMonth.map((item) => item.month),
    datasets: [
      {
        label: 'Valor das Notas Fiscais Emitidas por Mês',
        data: metrics.invoicesByMonth.map((item) => item.value),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };
  
  const dataCustomers = {
    labels: metrics.customersByMonth.map((item) => item.month),
    datasets: [
      {
        label: 'Número de Clientes por Mês',
        data: metrics.customersByMonth.map((item) => item.count),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  
  const dataSubscriptions = {
    labels: metrics.subscriptionsByMonth.map((item) => item.month),
    datasets: [
      {
        label: 'Novas Assinaturas por Mês',
        data: metrics.subscriptionsByMonth.map((item) => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Gráficos Mensais',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }


  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold mb-8 text-gray-800">Painel de Administração</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Total de Notas Emitidas</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{invoice.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Valor Total das Notas Emitidas</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">R$ {invoicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Clientes Ativos</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{users.filter((user) => user.status === 'active').length}</p>
      </div>
       <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold text-gray-700">Assinaturas canceladas</h2>
    <p className="text-3xl font-bold text-gray-800 mt-2">{subscriptions.filter((sub) => sub.status === 'canceled').length}</p>
  </div>
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold text-gray-700">Assinaturas em atraso</h2>
    <p className="text-3xl font-bold text-gray-800 mt-2">{subscriptions.filter((sub) => sub.status === 'suspended').length}</p>
  </div>
{/*   <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold text-gray-700">Cancelamentos de Assinatura</h2>
    <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.subscriptionCancellations}</p>
  </div> */}
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <h2 className="text-lg font-semibold text-gray-700">Receita Total de Assinaturas</h2>
    <p className="text-3xl font-bold text-gray-800 mt-2">R$ {((plans?.items[0].pricing_scheme.price / 100) * users.filter((user) => user.status === 'active').length).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
  </div>
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Clientes Inativos</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{users.filter((user) => user.status === 'inactive').length}</p>
      </div>
       <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-semibold text-gray-700">Quantidade de planos</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{[plans]?.length}</p>
      </div>
    </div>

{/*     <div className="flex flex-col gap-4">
      <div className="flex justify-center gap-4">
        <button
          className={`px-4 py-2 rounded-md ${selectedChart === 'invoices' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setSelectedChart('invoices')}
        >
          Notas Fiscais
        </button>
        <button
          className={`px-4 py-2 rounded-md ${selectedChart === 'customers' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setSelectedChart('customers')}
        >
          Clientes
        </button>
        <button
          className={`px-4 py-2 rounded-md ${selectedChart === 'subscriptions' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setSelectedChart('subscriptions')}
        >
          Assinaturas
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {selectedChart === 'invoices' && <Bar options={options} data={dataInvoices} />}
        {selectedChart === 'customers' && <Bar options={options} data={dataCustomers} />}
        {selectedChart === 'subscriptions' && <Bar options={options} data={dataSubscriptions} />}
      </div>
    </div> */}
  </div>
  );
}