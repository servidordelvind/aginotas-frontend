import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, XCircle, Calendar, File, Check, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api.ts';

interface Customer {
  _id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  user: {
    _id: string;
    email: string;
  }
  address: {
    street: string;
    number: string;
    neighborhood: string;
    cityCode: string;
    city: string;
    state: string;
    zipCode: string;
  };
  inscricaoMunicipal?: string;
}

interface Schedule {
  customer_id: string;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedulings, setSchedulings] = useState<Schedule[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGerating, setIsGerating] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    inscricaoMunicipal: '',
    user: {
      _id: '',
      email: '',
    },
    address: {
      street: '',
      number: '',
      neighborhood: '',
      cityCode: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  //Agendando NF
  const [subscription, setSubscription] = useState({
    billingDay: 1,
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    description: '',

    itemListaServico: '801',
    codigoCnae: '8531700'
  });

  //Criando NF na hora
  const [invoice, setInvoice] = useState({
    amount: 0,
    description: '',

    itemListaServico: '801',
    codigoCnae: '8531700'
  });


  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.find_customers();
      const scheduledata = await api.find_schedulings();
      setCustomers(data || []);
      setSchedulings(scheduledata || []);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
  }, [schedulings]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.create_customer(newCustomer);
      toast.success('Cliente adicionado com sucesso!');
      location.reload();
    } catch (error) {
      toast.error('Erro ao adicionar cliente');
      console.error('Erro ao adicionar cliente:', error);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.delete_customer(id);
      setCustomers(customers.filter(c => c._id !== id));
      toast.success('Cliente removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover cliente');
      console.error('Erro ao remover cliente:', error);
    }
  };

  const handleDeactivateCustomer = async (id: string) => {
    try {

      const status = 'inactive';
      await api.changestatus_customer(id, status);
      location.reload();

      toast.success('Cliente desativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desativar cliente');
      console.error('Erro ao desativar cliente:', error);
    }
  };

  const handleActiveCustomer = async (id: string) => {
    try {

      const status = 'active';
      await api.changestatus_customer(id, status);
      location.reload();

      toast.success('Cliente ativado com sucesso!');
    } catch (error) {
      toast.error('Erro ao ativar cliente');
      console.error('Erro ao ativar cliente:', error);
    }
  };

  const handleCancelSchedule = async (id: string) => {
    try {
      await api.delete_schedule(id);
      toast.success('Agendamento cancelado com sucesso!');
      location.reload();
    } catch (error) {
      toast.error('Erro ao cancelar agendamento');
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  const handleConfigureSubscription = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsSubscriptionModalOpen(true);
  };

  const handleConfigureInvoice = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;
    //configurar agendamento da emissao das notas fiscais
    const data = {
      customer_id: selectedCustomer._id,
      user_id: customers[0]?.user._id,
      billing_day: subscription.billingDay,
      amount: subscription.amount,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      description: subscription.description,

      item_lista_servico: subscription.itemListaServico,
      codigo_cnae: subscription.codigoCnae,

      customer_data: {
        cpfCnpj: selectedCustomer.cnpj.replace(/[^\d]/g, ''),
        razaoSocial: selectedCustomer.name,
        inscricaoMunicipal: selectedCustomer.inscricaoMunicipal,
        email: selectedCustomer.email,
        endereco: {
          endereco: selectedCustomer.address.street,
          numero: selectedCustomer.address.number,
          bairro: selectedCustomer.address.neighborhood,
          codigoMunicipio: selectedCustomer.address.cityCode,
          cidadeNome: selectedCustomer.address.city,
          uf: selectedCustomer.address.state,
          cep: selectedCustomer.address.zipCode.replace(/[^\d]/g, '')
        },
        telefone: selectedCustomer.phone.replace(/[^\d]/g, '')
      }
    }

    try {
      if (selectedCustomer.status === 'active') {
        setIsGerating(true);
        await api.create_scheduling(data);
        toast.success('Agendamento configurado com sucesso!');
        setIsSubscriptionModalOpen(false);
        setIsGerating(false);
        location.reload();
      } else {
        toast.success('O contrato está inativo!');
      }
    } catch (error) {
      toast.error('Erro ao agendar emissão');
      console.error('Erro ao agendar emissão:', error);
    }

    /*     try {
          const { error } = await supabase
            .from('subscriptions')
            .insert([{
              customer_id: selectedCustomer._id,
              billing_day: subscription.billingDay,
              amount: subscription.amount,
              start_date: subscription.startDate,
              end_date: subscription.endDate,
              description: subscription.description,
              item_lista_servico: subscription.itemListaServico,
              codigo_cnae: subscription.codigoCnae,
              customer_data: {
                cpfCnpj: selectedCustomer.cnpj.replace(/[^\d]/g, ''),
                razaoSocial: selectedCustomer.name,
                inscricaoMunicipal: selectedCustomer.inscricaoMunicipal,
                endereco: {
                  endereco: selectedCustomer.address.street,
                  numero: selectedCustomer.address.number,
                  bairro: selectedCustomer.address.neighborhood,
                  codigoMunicipio: selectedCustomer.address.cityCode,
                  cidadeNome: selectedCustomer.address.city,
                  uf: selectedCustomer.address.state,
                  cep: selectedCustomer.address.zipCode.replace(/[^\d]/g, '')
                },
                telefone: selectedCustomer.phone.replace(/[^\d]/g, '')
              }
            }]);
    
          if (error) throw error;
    
          toast.success('Assinatura configurada com sucesso!');
          setIsSubscriptionModalOpen(false);
        } catch (error) {
          toast.error('Erro ao configurar assinatura');
          console.error('Erro ao configurar assinatura:', error);
        } */
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;
    const data = {
      invoice: invoice,

      customer_id: selectedCustomer._id,
      user_id: customers[0]?.user._id,
      billing_day: subscription.billingDay,
      amount: subscription.amount,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      description: subscription.description,

      item_lista_servico: subscription.itemListaServico,
      codigo_cnae: subscription.codigoCnae,
      customer_data: {
        cpfCnpj: selectedCustomer.cnpj.replace(/[^\d]/g, ''),
        razaoSocial: selectedCustomer.name,
        inscricaoMunicipal: selectedCustomer.inscricaoMunicipal,
        email: selectedCustomer.email,
        endereco: {
          endereco: selectedCustomer.address.street,
          numero: selectedCustomer.address.number,
          bairro: selectedCustomer.address.neighborhood,
          codigoMunicipio: selectedCustomer.address.cityCode,
          cidadeNome: selectedCustomer.address.city,
          uf: selectedCustomer.address.state,
          cep: selectedCustomer.address.zipCode.replace(/[^\d]/g, '')
        },
        telefone: selectedCustomer.phone.replace(/[^\d]/g, '')
      }
    }

    try {
      if (selectedCustomer.status === 'active') {
        setIsGerating(true);
        await api.create_invoice(data);
        toast.success('Nota Fiscal gerada com sucesso!');
        setIsInvoiceModalOpen(false);
        setIsGerating(true);
        location.reload();
      } else {
        toast.success('O contrato está inativo!');
      }
    } catch (error) {
      toast.error('Erro ao Gerar Nota Fiscal');
      console.error('Erro ao Gerar Nota Fiscal:', error);
    }

  };

  const filteredCustomers = customers.filter(customer =>
    customer.cnpj.includes(searchTerm) ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  
  const handleCnpjBlur = async () => {
    const cnpj = newCustomer.cnpj.replace(/\D/g, ""); // Remove caracteres não numéricos
    if (cnpj.length === 14) {
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        const data = await response.json();

        if (data) {
          setNewCustomer({
            ...newCustomer,
            name: data.razao_social,
            address: {
              street: data.logradouro,
              number: data.numero || "",
              neighborhood: data.bairro,
              city: data.municipio,
              state: data.uf,
              zipCode: data.cep,
              cityCode: data.codigo_municipio,
            },
          });
        }
      } catch (error) {
        console.error("Erro ao buscar o CNPJ:", error);
        alert("Não foi possível buscar informações do CNPJ. Verifique o número e tente novamente.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por CNPJ ou nome..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">CNPJ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="border-t border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.cnpj}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                  <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => handleConfigureInvoice(customer)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Gerar Nota Fiscal"
                      >
                        <File className="w-5 h-5" />
                      </button>

                      {/* BOTAO AGENDAR */}
                      <button
                        onClick={() => handleConfigureSubscription(customer)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Emissão automizada"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>

                      {schedulings.map((schedule) => (
                        <>
                          {/* BOTAO CANCELAR AGENDAMENTO */}
                          {schedule.customer_id === customer._id &&
                            <button
                              onClick={() => handleCancelSchedule(customer._id)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Cancelar agendamento"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          }
                        </>
                      ))}

                      {customer.status === 'active' ? (
                        <button
                          onClick={() => handleDeactivateCustomer(customer._id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Finalizar Contrato"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActiveCustomer(customer._id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Ativar Contrato"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="text-red-600 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Novo Cliente</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="newCustomerForm" onSubmit={handleAddCustomer} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={newCustomer.cnpj}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cnpj: e.target.value })}
                      onBlur={handleCnpjBlur}
                      placeholder="Digite o CNPJ e saia do campo para buscar"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inscrição Municipal
                    </label>
                    <input
                      type="text"
                      value={newCustomer.inscricaoMunicipal}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, inscricaoMunicipal: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Endereço</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                    <input
                      type="text"
                      value={newCustomer.address.street}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, street: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={newCustomer.address.number}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, number: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={newCustomer.address.neighborhood}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, neighborhood: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={newCustomer.address.city}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, city: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      type="text"
                      value={newCustomer.address.state}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, state: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={newCustomer.address.zipCode}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, zipCode: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Município
                    </label>
                    <input
                      type="text"
                      value={newCustomer.address.cityCode}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, cityCode: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="newCustomerForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Assinatura */}
      {isSubscriptionModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Emita suas Notas de Forma Programada</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="subscriptionForm" onSubmit={handleSaveSubscription} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia do Faturamento
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={subscription.billingDay}
                    onChange={(e) => setSubscription({ ...subscription, billingDay: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Mensal
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={subscription.amount}
                    onChange={(e) => setSubscription({ ...subscription, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={subscription.startDate}
                    onChange={(e) => setSubscription({ ...subscription, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Término
                  </label>
                  <input
                    type="date"
                    value={subscription.endDate}
                    onChange={(e) => setSubscription({ ...subscription, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição do Serviço
                  </label>
                  <textarea
                    value={subscription.description}
                    onChange={(e) => setSubscription({ ...subscription, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="subscriptionForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isGerating}
              >
                {isGerating ? 'Agendando...' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Gerar Nota Fiscal */}
      {isInvoiceModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gerar Nota Fiscal</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="invoiceForm" onSubmit={handleGenerateInvoice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Mensal
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoice.amount}
                    onChange={(e) => setInvoice({ ...invoice, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição do Serviço
                  </label>
                  <textarea
                    value={invoice.description}
                    onChange={(e) => setInvoice({ ...invoice, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="invoiceForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isGerating}
              >
                {isGerating ? 'Gerando...' : 'Gerar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}