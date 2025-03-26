import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Users, Receipt, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(timezone);
dayjs.extend(utc);


interface Nota {
  customer: {
  _id: string;
  name: string;
  user: string;
},
  valor: number;
  status: string;
  date: string;
}


export function Dashboard() {

  const [customer, setCustomer] = useState([]);
  const [customeractive, setCustomerActive] = useState([]);
  const [invoice, setInvoice] = useState<Nota[]>([]);
  const [dayInvoicetoday, setDayInvoiceToday] = useState(0);
  const [dayInvoicelast7days, setDayInvoiceLast7Days] = useState(0);

  useEffect(() => {
    load_data(); 
  }, []);

  const load_data = async () => {
    const datainvoices = await api.find_invoices();
    setInvoice(datainvoices);
    const datacustomers = await api.find_customers();
    setCustomer(datacustomers);
    const datacustomeractive = await api.find_customers_actives();
    setCustomerActive(datacustomeractive);
  } 

  useEffect(() => {
  }, [customer,invoice,customeractive]);


  const processarNotasParaGrafico = (notas: Nota[]) => {
    const hoje = dayjs().tz('America/Sao_Paulo').startOf('day'); 
    const seteDiasAtras = hoje.subtract(7, 'day').startOf('day');
  
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
    const contagemPorDia: Record<string, number> = {
      Dom: 0, Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sab: 0
    };
  
    notas.forEach((nota) => {
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo');
      
      if (dataNota.isValid() && dataNota.isBetween(seteDiasAtras, hoje, 'day', '[]')) {
        const indiceDia = dataNota.day(); 
        const nomeDia = diasSemana[indiceDia]; 
        contagemPorDia[nomeDia]++;
      }
    });
  
    return Object.keys(contagemPorDia).map((dia) => ({
      name: dia,
      notas: contagemPorDia[dia],
    }));
  };

  const getNotasPorPeriodo = (notas: Nota[]) => {
    const hoje = dayjs().tz('America/Sao_Paulo').startOf('day');
    const seteDiasAtras = hoje.subtract(7, 'day').startOf('day');
    const trintaDiasAtras = hoje.subtract(30, 'day').startOf('day');
  
    const notasHoje = notas.filter((nota) => { 
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo').startOf('day'); 
      return dataNota.isSame(hoje, 'day');
    });
  
    const notasUltimos7Dias = notas.filter((nota) => {
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo').startOf('day');
      return dataNota.isBetween(seteDiasAtras, hoje, 'day', '[]');
    });

    const notasUltimos30Dias = notas.filter((nota) => {
      const dataNota = dayjs(nota.date).tz('America/Sao_Paulo').startOf('day');
      return dataNota.isBetween(trintaDiasAtras, hoje, 'day', '[]');
    });

    return {
      notasHoje,
      notasUltimos7Dias,
      notasUltimos30Dias,
    };
  };
  
  function somarValoresNotas(notas: Nota[]): number {
    return notas.reduce((acumulador, nota) => {
      const valor = Number(nota.valor) || 0;
      return acumulador + valor;
    }, 0);
  }



  const data = processarNotasParaGrafico(invoice);
  const days = getNotasPorPeriodo(invoice);
  const valorAreceber = somarValoresNotas(days.notasUltimos30Dias);


  useEffect(()=>{
    setDayInvoiceToday(days.notasHoje.length);
    setDayInvoiceLast7Days(days.notasUltimos7Dias.length);
  },[days])

  console.log(invoice);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Notas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">{dayInvoicetoday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Últimos 7 dias</p>
              <p className="text-2xl font-bold text-gray-900">{dayInvoicelast7days}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{customeractive.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Previsão Mensal</p>
              <p className="text-2xl font-bold text-gray-900">R$ {valorAreceber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas Emitidas - Últimos 7 dias</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="notas" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status de Emails */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status de Envio de Notas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data/Hora</th>
{/*                 <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ações</th> */}
              </tr>
            </thead>
            <tbody>
              {invoice.map((item) => (
                <tr key={item.customer._id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                      item.status.toLowerCase() === 'emitida' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status.toLowerCase() === 'emitida' ? '✓' : '!'} {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{item.customer.name}</td>
                    <td className="py-3 px-4 text-gray-500">
                    {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}