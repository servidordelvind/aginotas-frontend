import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Receipt } from 'lucide-react';
import nomelogodelvind from '../public/logonomelogo.png';

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
            <img
              src={nomelogodelvind}
              alt="Nome Logo Delvind"
              className="h-32 w-32 object-contain"
            />
          </div>
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
            <h2 className="text-2xl font-bold text-white mb-2">Plano Profissional</h2>
            <div className="flex justify-center items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-white">R$49,90</span>
              <span className="text-gray-400">/mês</span>
            </div>
            <Link 
              to="/register" 
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Começar Teste Grátis de 14 Dias
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