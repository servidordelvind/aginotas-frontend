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
import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import { toast } from 'sonner';

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
  razaoSocial: string;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load_data(); 
  }, []);

  const load_data = async () => {
    const datainvoices = await api.find_invoices();
    setInvoice(datainvoices);
    const datacustomers = await api.find_customers_user();
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
      if (nota.status.toLowerCase() === 'emitida' || nota.status.toLowerCase() === 'substituida') {
        const valor = Number(nota.valor) || 0;
        return acumulador + valor;
      }
      return acumulador;
    }, 0);
  }

  const data = processarNotasParaGrafico(invoice);
  const days = getNotasPorPeriodo(invoice);
  const valorAreceber = somarValoresNotas(days.notasUltimos30Dias);

  useEffect(()=>{
    setDayInvoiceToday(days.notasHoje.length);
    setDayInvoiceLast7Days(days.notasUltimos7Dias.length);
  },[days])

  function downloadCustomerXml(customer: any) {
    const blob = new Blob([customer.xml], { type: 'application/xml' });
    const fileName = `${customer.data.Rps.Servico.Discriminacao}_nota.xml`;
    saveAs(blob, fileName);
  }


/*   async function criarNotaFiscal(customer: any) {
    //console.log(customer);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 em pontos
  
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 10;
  
    const drawText = (text: string, x: number, y: number, size = fontSize) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };
  
    // Cabeçalho
    drawText('MUNICIPIO DE MEDIANEIRA - Nota Fiscal de Serviços Eletrônica', 150, 800, 12);
    drawText(`Número: ${customer.data.Rps.IdentificacaoRps.Numero}`, 50, 780);
    drawText(`Data Prestação: ${dayjs(customer.data.Rps.DataEmissao).format('DD/MM/YYYY')}`, 250, 780);
    drawText(`Autenticidade: ${customer.xml.match(/<ns2:CodigoVerificacao>(.*?)<\/ns2:CodigoVerificacao>/)?.[1] || ''}`, 450, 780);
    drawText('SITE AUTENTICIDADE: https://medianeira.oxy.elotech.com.br/iss/autenticar-documento-fiscal', 50, 765, 8);
    
    // Dados do prestador
    drawText('DADOS DO PRESTADOR DO SERVIÇO', 50, 740, 11);
    drawText(`Nome/Razão Social: ${customer.user.name}`, 50, 725);
    drawText(`CNPJ: ${customer.user.cnpj}`, 50, 710);
    drawText(`Insc. Municipal: ${customer.user.inscricaoMunicipal} | Regime Fiscal: Simples Nacional`, 50, 695);
    drawText(`Endereço: ${customer.user.endereco || 'N/A'}`, 50, 680);
    drawText(`Município/UF: ${customer.user.cidade}-${customer.user.estado} | CEP: ${customer.user.cep || 'N/A'}`, 50, 665);
    drawText(`Fone: ${customer.user.phone || 'N/A'} | E-mail: ${customer.user.email}`, 50, 650);
    
    // Dados do tomador
    drawText('DADOS DO TOMADOR DO SERVIÇO', 50, 625, 11);
    drawText(`Nome/Razão Social: ${customer.customer.razaoSocial || customer.customer.name }`, 50, 610);
    drawText(`CPF/CNPJ: ${customer.customer.cnpj !== 'undefined' ? customer.customer.cnpj : customer.customer.cpf !== 'undefined' ? customer.customer.cpf : 'N/A'}`, 50, 595);
    drawText(`Endereço: ${customer.customer.address.street}, ${customer.customer.address.number} - ${customer.customer.address.neighborhood}`, 50, 580);
    drawText(`Município/UF: ${customer.customer.address.city}-${customer.customer.address.state} | CEP: ${customer.customer.address.zipCode}`, 50, 565);
    drawText(`Fone: ${customer.customer.phone} | E-mail: ${customer.customer.email}`, 50, 550);
    
    // Serviço
    drawText('DEFINIÇÃO DO SERVIÇO', 50, 525, 11);
    drawText(`Item da Lista de Serviços da LC nº 116/03: ${customer.data.Rps.Servico.ListaItensServico[0].ItemListaServico} ${customer.data.Rps.Servico.ListaItensServico[0].Descricao}`, 50, 510);
    drawText(`CNAE: ${customer.data.Rps.Servico.ListaItensServico[0].CodigoCnae} | Competência: ${dayjs(customer.data.Rps.Competencia).format('MM/YYYY')}`, 50, 495);
    drawText(`Local da Prestação: ${customer.user.cidade}-${customer.user.estado} | Situação da NFS-e: ${customer.status.toUpperCase()}`, 50, 480);
    drawText('Natureza da Operação: EXIGÍVEL', 50, 465);
    
    // Discriminação
    drawText('DISCRIMINAÇÃO DO SERVIÇO', 50, 440, 11);
    drawText(`- ${customer.data.Rps.Servico.Discriminacao}`, 50, 425);
    drawText(`Descrição: ${customer.data.Rps.Servico.ListaItensServico?.[0]?.Descricao || 'N/A'} | Qtde: ${(customer.data.Rps.Servico.ListaItensServico?.[0]?.Quantidade || 0).toFixed(2)} | Valor Unitário: R$ ${(customer.data.Rps.Servico.ListaItensServico?.[0]?.ValorUnitario || 0).toFixed(2)} | Valor Total: R$ ${(customer.data.Rps.Servico.Valores?.ValorServicos || 0).toFixed(2)}`, 50, 410);
    
    // Tributos
    drawText('TRIBUTOS INCIDENTES', 50, 380, 11);
    drawText(`ISSQN: R$ ${(customer.data.Rps.Servico.Valores?.ValorIss || 0).toFixed(2)} | Alíquota: ${(customer.data.Rps.Servico.Valores?.Aliquota || 0).toFixed(2)}% | Retido: ${customer.data.Rps.Servico.IssRetido === 2 ? 'Não' : 'Sim'}`, 50, 365);
    drawText('PIS / COFINS / INSS / IR / CSLL / CPP / Impostos Federais: R$ 0,00', 50, 350);
    
    // Totais
    drawText('TOTALIZAÇÃO DO DOCUMENTO FISCAL', 50, 320, 11);
    drawText(`Base de Cálculo ISSQN: R$ ${(customer.data.Rps.Servico.Valores?.BaseCalculo || 0).toFixed(2)}`, 50, 305);
    drawText(`Valor Total: R$ ${(customer.data.Rps.Servico.Valores?.ValorServicos || 0).toFixed(2)} | Descontos: R$ ${(customer.data.Rps.Servico.Valores?.DescontoIncondicionado || 0).toFixed(2)} | Valor Líquido: R$ ${(customer.data.Rps.Servico.Valores?.ValorLiquido || 0).toFixed(2)}`, 50, 290);
    
    // Assinatura
    drawText(`Recebemos de ${customer.user.name} os serviços constantes nesta NFS-e.`, 50, 260);
    drawText('DATA: ____/____/_____   Assinatura: ____________________________', 50, 240);
  
    // Salvar
    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), 'modelo-nota-fiscal.pdf');
  }  */

    async function criarNotaFiscalPDF (item: any) {
      try {
        setLoading(true);
        await api.Export_Invoice_PDF(item);
        setLoading(false);
        toast.success("PDF gerado com sucesso!");
      } catch (error) {
        toast.error("Ocorreu um erro ao gerar o PDF");
        return;
      }
    }

    if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
        <h1 className="text-2xl sm:text-left font-bold text-gray-900 text-center">Painel de Controle</h1>      
      
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
                <p className="text-2xl font-bold text-gray-900">
                R$ {valorAreceber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
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
          <div className="max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cliente</th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data/Hora</th>
          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {invoice.map((item) => (
          <tr key={item.customer._id} className="border-b border-gray-100">
            <td className="py-3 px-4">
              <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
              item.status.toLowerCase() === 'emitida'
                ? 'bg-green-100 text-green-700'
                : item.status.toLowerCase() === 'substituida'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
            }`}
              >
            {item.status.toLowerCase() === 'emitida'
              ? '✓'
              : item.status.toLowerCase() === 'substituida'
              ? '↺'
              : '!'}{' '}
            {item.status}
              </span>
            </td>
            <td className="py-3 px-4 text-gray-700">
              {item.customer.name || item.customer.razaoSocial}
            </td>
            <td className="py-3 px-4 text-gray-500">
              {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
            </td>
            <td className="py-3 px-4">
              <div className="flex gap-2">
            <button
              onClick={() => downloadCustomerXml(item)}
              className="text-blue-600 hover:underline"
            >
              Baixar XML
            </button>
            <button
              onClick={() => criarNotaFiscalPDF(item)}
              className="text-blue-600 hover:underline"
            >
              Baixar PDF
            </button>
              </div>
            </td>
          </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      </div>
    </div>
  );
}