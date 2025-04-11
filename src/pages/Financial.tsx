import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";
import { toast } from 'sonner';

export function Financial() {
const [view, setView] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [value, setValue] = useState();
  const [paymentType, setPaymentType] = useState("immediate"); // immediate, installment, recurring
  const [installments, setInstallments] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [receivables, setReceivables] = useState([]);
  const [agrupado, setAgrupado] = useState({});
  const [alreadyPaid, setAlreadyPaid] = useState(false);
const [loading, setLoading] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleDetails = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  async function Data() {
    const clientes = await api.find_customers_user();
    const Receipts = await api.Find_Receipts();
    setReceivables(Receipts);
    setAgrupado(agruparPorStatus(Receipts));
    setCustomers(clientes);    
  }

  useEffect(() => {
    setLoading(true);
    Data();
    setLoading(false);
  }, []);

  const handleCreateReceivable = async () => {
    if (!value){return;};
    if (!selectedCustomer || value <= 0 || !startDate) return;

    //const entries = [];
    const baseDate = new Date(startDate);
    setLoading(true);
    if (paymentType === "immediate") {
      await api.Create_Receive({
        customer: selectedCustomer,
        value: parseFloat(value),
        dueDate: startDate,
        status: "A Receber",
      })
/*       entries.push({
        customer: selectedCustomer,
        value,
        dueDate: startDate,
        status: "A Receber",
      }); */
    } else if (paymentType === "installment") {
      for (let i = 0; i < installments; i++) {
        const due = new Date(baseDate);
        due.setMonth(due.getMonth() + i);
        await api.Create_Receive({
          customer: selectedCustomer,
          value: parseFloat((value / installments).toFixed(2)),
          dueDate: due.toISOString().split("T")[0],
          status: "Parcelado",
        })
/*         entries.push({
          customer: selectedCustomer,
          value: parseFloat((value / installments).toFixed(2)),
          dueDate: due.toISOString().split("T")[0],
          status: "Parcelado",
        }); */
      }
    } else if (paymentType === "recurring") {
        for (let i = 0; i < 12; i++) {
          const due = new Date(baseDate);
          due.setMonth(due.getMonth() + i);
    
          await api.Create_Receive({
            customer: selectedCustomer,
            value: parseFloat(value),
            dueDate: due.toISOString().split("T")[0],
            status: "Recorrente",
          })

/*           entries.push({
            customer: selectedCustomer,
            value,
            dueDate: due.toISOString().split("T")[0],
            status: "Recorrente",
          }); */
        }
      } else if (paymentType === "paid") {

        await api.Create_Receive({
          customer: selectedCustomer,
          value: parseFloat(value),
          dueDate: startDate,
          status: "Pago",
        })

/*         entries.push({
          customer: selectedCustomer,
          value,
          dueDate: startDate,
          status: "Pago",
        }); */
      }

    //setReceivables((prev) => [...prev, ...entries]);
    Data();
    setLoading(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setValue(0);
    setPaymentType("immediate");
    setInstallments(1);
    setStartDate("");
  };


  const chartData = [
    {
      name: "A Receber",
      total: receivables.filter((r) => r.status === "A Receber").reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Pago",
      total: receivables.filter((r) => r.status === "Pago").reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Recorrente",
      total: receivables.filter((r) => r.status === "Recorrente").reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Parcelamentos",
      total: receivables.filter((r) => r.status === "Parcelado").reduce((sum, r) => sum + r.value, 0),
    },
    {
      name: "Em atraso",
      total: (agrupado['Em Atraso'] || []).length /* receivables.filter((r) => r.status === "Em atraso").reduce((sum, r) => sum + r.value, 0) */,
    },
  ];

  const handleMarkAsPaid = async (id: string) => {
    try {
      setLoading(true);
      const status = 'Pago';
      await api.Update_Receive(id , status);
      toast.success('Operação realizada com sucesso!');
      Data();
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao realizar operação');
      return;
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.Delete_Receive(id);
      toast.success('Operação realizada com sucesso!');
      Data();
      setLoading(false);
    } catch (error) {
      toast.error('Erro ao realizar operação');
      return;
    }
  }

  function agruparPorStatus(faturas: any[]) {
    const resultado: any = {
      Pago: [],
      Recorrente: [],
      Parcelado: [],
      'A Receber': [],
      'Em Atraso': [],
      Outros: []
    };
  
    const hoje = new Date();
  
    for (const fatura of faturas) {
      const status = fatura.status;
      const dueDate = new Date(fatura.dueDate);
  
      if (status === 'Pago') {
        resultado.Pago.push(fatura);
      } else if (status === 'Recorrente') {
        resultado.Recorrente.push(fatura);
      } else if (status === 'Parcelado') {
        resultado.Parcelado.push(fatura);
      } else if (status === 'A Receber') {
        resultado['A Receber'].push(fatura);
      } else if (dueDate < hoje && status !== 'Pago') {
        resultado['Em Atraso'].push(fatura);
      } else {
        resultado.Outros.push(fatura);
      }
    }
  
    return resultado;
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setView("dashboard")}
        className={`px-4 py-2 rounded font-medium ${
          view === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        Dashboard
      </button>
      <button
        onClick={() => setView("payments")}
        className={`px-4 py-2 rounded font-medium ${
          view === "payments" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
        }`}
      >
        Pagamentos
      </button>
    </div>

    {view === "dashboard" && (
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-bold">Visão Geral Financeira</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 p-4 rounded shadow">
            <p className="text-sm text-gray-600">Total a Receber</p>
            <p className="text-lg font-bold">
              R$ {chartData[0].total.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p className="text-sm text-gray-600">Total Pago</p>
            <p className="text-lg font-bold">R$ {chartData[1].total.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p className="text-sm text-gray-600">Recorrente</p>
            <p className="text-lg font-bold">R$ {chartData[2].total.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p className="text-sm text-gray-600">Em atraso</p>
            <p className="text-lg font-bold">R$ {chartData[4].total.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p className="text-sm text-gray-600">Clientes</p>
            <p className="text-lg font-bold">{customers.length}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded shadow">
            <p className="text-sm text-gray-600">Parcelamentos</p>
            <p className="text-lg font-bold">R$ {chartData[3].total.toFixed(2)}</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}

    {view === "payments" && (
      <div>
            <h2 className="text-xl font-bold mb-4">Fluxo Financeiro</h2>
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select
              value={selectedCustomer?._id || ""}
              onChange={(e) => {
                const id = e.target.value;
                const customer = customers.find((c) => c._id === id);
                setSelectedCustomer(customer);
              }}
              className="w-full border mt-1 p-2 rounded"
            >
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name || customer.razaoSocial}
                </option>
              ))}
            </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <input
                type="number"
                value={value}
                placeholder="Ex: 1600,90"
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full border mt-1 p-2 rounded"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border mt-1 p-2 rounded"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Recebimento</label>
              <div className="flex flex-wrap gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="immediate"
                    checked={paymentType === "immediate"}
                    onChange={() => setPaymentType("immediate")}
                  />
                  Receber Agora
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="installment"
                    checked={paymentType === "installment"}
                    onChange={() => setPaymentType("installment")}
                  />
                  Parcelado
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="recurring"
                    checked={paymentType === "recurring"}
                    onChange={() => setPaymentType("recurring")}
                  />
                  Recorrente
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="paid"
                    checked={paymentType === "paid"}
                    onChange={() => setPaymentType("paid")}
                  />
                  Valor pago
                </label>
              </div>            
            </div>

            {paymentType === "installment" && (
            <div>
                <label className="block text-sm font-medium text-gray-700">Quantidade de Parcelas</label>
                <input
                type="number"
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                min={1}
                className="w-full border mt-1 p-2 rounded"
                />
            </div>
            )}
            <button
            onClick={handleCreateReceivable}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
            Criar Recebimento
            </button>
            </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Recebimentos</h3>
                <div className="bg-white rounded-lg shadow p-4 max-h-96 overflow-y-auto">
                  {receivables.length === 0 ? (
                    <p className="text-gray-500">Nenhum lançamento ainda.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {receivables.map((r, idx) => (
                        <div
                          key={idx}
                          className="border rounded p-3 flex flex-col gap-2 bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                          <p className="font-medium max-w-[100px] truncate">
                            {r.customer.name || r.customer.razaoSocial}
                          </p>
                            <div className="flex gap-2">
                              {r.status != 'Pago' && (
                              <button
                                onClick={() => handleMarkAsPaid(r._id)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200"
                              >
                                Dar baixa
                              </button>
                              )}
                              <button
                                onClick={() => handleDelete(r._id)}
                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-all duration-200"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleDetails(idx)}
                            className="text-blue-600 text-sm underline self-start"
                          >
                            {expandedIndex === idx ? "Ocultar detalhes" : "Ver detalhes"}
                          </button>
                          {expandedIndex === idx && (
                            <div className="text-sm text-gray-700">
                              <p>
                                <strong>Valor:</strong> R$ {r.value.toFixed(2)}
                              </p>
                              <p>
                                <strong>Vencimento:</strong> {r.dueDate}
                              </p>
                              <p>
                                <strong>Status:</strong> {r.status}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
      </div>
    )}
    </div>
  )
}
