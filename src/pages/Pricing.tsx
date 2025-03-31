import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Receipt } from 'lucide-react';
import { api } from '../lib/api';

const features = [
  'Notas Fiscais Ilimitadas',
  'Faturamento Recorrente Automático',
  'Gestão de Clientes',
  'Notificações por Email',
  'Geração de PDF das Notas',
  'Acompanhamento de Pagamentos',
  'Análises Básicas',
  'Suporte por Email'
];

export function Pricing() {

  const [plans, setPlans] = useState([]);

useEffect(() => {
  async function loadData() {
    try {
      const response = await api.find_plans();
      setPlans(response.data[0]);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  }
  loadData();
}, []);

//console.log('Items:', plans.items[0].pricing_scheme.price);
//console.log('Plans:', plans.plan.trial_period_days);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Receipt className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold text-white">AgiNotas</span>
        </Link>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-white">Entrar</Link>
        </div>
      </nav>

      {/* Pricing Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Preço Simples e Transparente</h1>
          <p className="text-xl text-gray-300">Tudo que você precisa para gerenciar suas notas fiscais de forma eficiente</p>
        </div>

        <div className="max-w-lg mx-auto bg-gray-800 rounded-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-2">{plans.plan.name || ''}</h2>
            <div className="flex justify-center items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-white">R${plans.items[0].pricing_scheme.price || ''}</span>
              <span className="text-gray-400">/{plans.plan.interval || ''}</span>
            </div>
            <Link 
              to="/register" 
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => {
              document.cookie = `idPlan=${plans.plan.id || ''}; path=/;`;
              }}
            >
              Começar Teste Grátis de {plans.plan.trial_period_days || ''} Dias
            </Link>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Tudo que você precisa:</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}