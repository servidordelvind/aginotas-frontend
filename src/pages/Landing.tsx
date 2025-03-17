import React from 'react';
import { Link } from 'react-router-dom';
import { Receipt, CheckCircle2, ArrowRight } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Receipt className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold text-white">AgiNotas</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-300 hover:text-white">Entrar</Link>
          <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Teste Grátis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            Automatize seu Faturamento
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Simplifique seu processo de cobrança com notas fiscais recorrentes automáticas. Economize tempo e receba mais rápido.
          </p>
          <Link 
            to="/pricing" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ver Planos <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Faturamento Automático</h3>
            <p className="text-gray-400">Configure cobranças recorrentes e deixe nosso sistema fazer o resto.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Acompanhamento Inteligente</h3>
            <p className="text-gray-400">Monitore pagamentos e receba notificações instantâneas de atualizações.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Portal do Cliente</h3>
            <p className="text-gray-400">Ofereça aos seus clientes acesso ao histórico de notas fiscais e opções de pagamento.</p>
          </div>
        </div>
      </div>
    </div>
  );
}