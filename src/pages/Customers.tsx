import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, XCircle, Calendar, File, FileCodeIcon,Check,Copy, Ban, Edit, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FaEye } from 'react-icons/fa';
import { api } from '../lib/api.ts';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

interface Customer {
  _id: string;
  name: string;
  cnpj: string;
  cpf: string;
  razaoSocial: string;
  nomeFantasia: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  user: {
    _id: string;
    email: string;
    senhaelotech: string;
  };
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
  inscricaoEstadual?: string;
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
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGerating, setIsGerating] = useState(false);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<'none' | 'edit' | 'editpessoafisica' | 'invoice' | 'replace' | 'subscription' | 'scheduling' | 'history'> ('none');

  const [handleinvoice, setHandleInvoice] = useState({
    _id: '',
    customer: '',
    numeroLote: 0,
    identificacaoRpsnumero: 0,
    xml: '',
    data: {
      Rps: {
        Servico: {
          Discriminacao: '',
          descricao: '',
          item_lista: '',
          cnae: '',
          quantidade: 0,
          valor_unitario: 0,
          desconto: 0,
          ListaItensServico: [
            {
              Discriminacao: '',
              Descricao: '',
              ItemListaServico: '',
              CodigoCnae: '',
              Quantidade: 0,
              ValorUnitario: 0,
              ValorLiquido: 0,
              ValorDesconto: 0
            }
          ]
        }
      }
    }
  });

  const [newCustomer, setNewCustomer] = useState<Customer>({
    _id: '',
    name: '',
    cnpj: '',
    cpf: '',
    razaoSocial: '',
    nomeFantasia: '',
    email: '',
    phone: '',
    inscricaoMunicipal: '',
    inscricaoEstadual: '',
    user: {
      _id: '',
      email: '',
      senhaelotech: '',
    },
    address: {
      street: '',
      number: '',
      neighborhood: '',
      cityCode: '',
      city: '',
      state: '',
      zipCode: ''
    },
    status: 'active',
  });

  // Estados para CNPJ
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState('');

  const [SelectType, setSelectType] = useState('');

  const [cnaes, setCnaes] = useState<any[]>([]);
  const [itemservico, setItemServico] = useState<any[]>([]);


  // Funções para CNPJ
  const validateCnpj = (cnpj: string): boolean => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');

    if (cleanedCnpj.length !== 14) {
      setCnpjError('CNPJ deve ter 14 dígitos');
      return false;
    }

    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
    if (cnpj.length > 0 && !cnpjRegex.test(cnpj) && cnpj.length >= 14) {
      setCnpjError('Formato inválido. Use 00.000.000/0000-00');
      return false;
    }

    setCnpjError('');
    return true;
  };

  const formatCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length > 5) formatted = `${formatted.slice(0, 6)}.${formatted.slice(6)}`;
    if (cleaned.length > 8) formatted = `${formatted.slice(0, 10)}/${formatted.slice(10)}`;
    if (cleaned.length > 12) formatted = `${formatted.slice(0, 15)}-${formatted.slice(15, 17)}`;

    return formatted.slice(0, 18);
  };


/*   const validateCpf = (cpf: string): boolean => {
    const cleanedCpf = cpf.replace(/\D/g, '');

    if (cleanedCpf.length !== 11) {
      setCnpjError('CPF deve ter 11 dígitos');
      return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleanedCpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanedCpf.substring(9, 10))) {
      setCnpjError('CPF inválido');
      return false;
    }

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleanedCpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanedCpf.substring(10, 11))) {
      setCnpjError('CPF inválido');
      return false;
    }

    setCnpjError('');
    return true;
  };

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    let formatted = cleaned;
    if (cleaned.length > 3) formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length > 6) formatted = `${formatted.slice(0, 7)}.${formatted.slice(7)}`;
    if (cleaned.length > 9) formatted = `${formatted.slice(0, 11)}-${formatted.slice(11, 13)}`;

    return formatted.slice(0, 14);
  }; */

  const fetchCompanyData = async () => {
    const cleanedCnpj = newCustomer.cnpj.replace(/\D/g, '');

    if (!validateCnpj(newCustomer.cnpj) || cleanedCnpj.length !== 14) return;

    setLoadingCnpj(true);
    setCnpjError('');

    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanedCnpj}`);

      if (!response.ok) throw new Error('Erro na consulta');

      const data = await response.json();

      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.message || 'CNPJ não encontrado');
      }

      setNewCustomer({
        ...newCustomer,
        name: data.razao_social || '',
        inscricaoMunicipal: data.inscricao_municipal || '',
        email: data.estabelecimento.email || '',
        address: {
          ...newCustomer.address,
          street: `${data.estabelecimento.tipo_logradouro || ''} ${data.estabelecimento.logradouro || ''}`.trim(),
          city: data.estabelecimento.cidade.nome || '',
          state: data.estabelecimento.estado.sigla || '',
        },
      });
    } catch (err) {
      console.error('Erro na consulta:', err);
      setCnpjError('Dados não encontrados. Preencha manualmente');
      setNewCustomer({
        ...newCustomer,
        name: '',
        inscricaoMunicipal: '',
        email: '',
        address: {
          ...newCustomer.address,
          street: '',
          city: '',
          state: '',
        },
      });
    } finally {
      setLoadingCnpj(false);
    }
  };

/*   const fetchPersonData = async () => {
    const cleanedCpf = newCustomer.cpf.replace(/\D/g, '');

    if (cleanedCpf.length !== 11) {
      setCnpjError('CPF deve ter 11 dígitos');
      return;
    }

    setLoadingCnpj(true);
    setCnpjError('');

    try {
      const response = await fetch(`https://api.cpfdata.com/cpf/${cleanedCpf}`);

      if (!response.ok) throw new Error('Erro na consulta');

      const data = await response.json();

      console.log(data);

      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.message || 'CPF não encontrado');
      }

      setNewCustomer({
        ...newCustomer,
        name: data.nome || '',
        cpf: data.cpf || '',
        razaoSocial: data.nome || '',
        email: data.email || '',
        address: {
          ...newCustomer.address,
          street: data.endereco.logradouro || '',
          city: data.endereco.cidade || '',
          state: data.endereco.estado || '',
        },
      });
    } catch (err) {
      console.error('Erro na consulta:', err);
      setCnpjError('Dados não encontrados. Preencha manualmente');
      setNewCustomer({
        ...newCustomer,
        name: '',
        email: '',
        address: {
          ...newCustomer.address,
          street: '',
          city: '',
          state: '',
        },
      });
    } finally {
      setLoadingCnpj(false);
    }
  }; */

  useEffect(() => {
    const timer = setTimeout(() => {
      if (newCustomer.cnpj.replace(/\D/g, '').length === 14) {
        fetchCompanyData();
      }
/*       if (newCustomer.cpf.replace(/\D/g, '').length === 11) {
        fetchPersonData();
      } */
    }, 1500);

    return () => clearTimeout(timer);
  }, [newCustomer.cnpj]);

  //Agendando NF
  const [subscription, setSubscription] = useState({
    billingDay: 1,
    amount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    description: '',
    itemListaServico: '',
    codigoCnae: ''
  });

  //Criando NF na hora
  const [invoice, setInvoice] = useState({
    discriminacao: '',
    descricao: '',
    item_lista: '',
    cnpj: selectedCustomer?.cnpj || "",
    cnae: '',
    quantidade: 1,
    valor_unitario: '',
    desconto: '0',
    iss_retido: false,
    aliquota_iss: 4.41,
    retencoes: {
      irrf: false,
      pis: false,
      cofins: false,
    },
    amount: 0,
    description: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    dateOfCompetence: new Date().toISOString().split('T')[0],
    observations: '',
    razao_social: '',
    nome_fantasia: '',
    endereco: '',
    logradouro: '',
    numero: '',

  });

  const handleViewInvoiceHistory = async (customer: Customer) => {
    try {
      const response = await api.find_all_invoices_customer(customer._id);
      setInvoiceHistory(response || []);
      setActiveModal('history');
      setSelectedCustomer(customer);
    } catch (error) {
      toast.error('Erro ao buscar notas fiscais do cliente');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleViewScheduleHistory = async (id: string) => {
    setActiveModal('scheduling');
    loadInvoiceHistory(id);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSubscriptionModalOpen(false);
    setIsInvoiceModalOpen(false);
    setActiveModal('none');
    setNewCustomer({
      _id: '',
      name: '',
      cnpj: '',
      cpf: '',
      razaoSocial: '',
      nomeFantasia: '',
      email: '',
      phone: '',
      inscricaoMunicipal: '',
      inscricaoEstadual: '',
      user: {
        _id: '',
        email: '',
        senhaelotech: '',
      },
      address: {
        street: '',
        number: '',
        neighborhood: '',
        cityCode: '',
        city: '',
        state: '',
        zipCode: ''
      },
      status: 'active',
    });
  }

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
    const response = await api.find_all_invoices_customer(id);
    if (response.length > 0) {
      toast.error('Não é possível excluir o cliente, pois ele possui notas fiscais emitidas.');
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir esse cliente?")) {
      return;
    }

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
    if (!window.confirm("Tem certeza que deseja cancelar o agendamento?")) {
      return;
    }

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
    setActiveModal('subscription');  // Alterando para 'subscription' ao abrir o modal de assinatura
    setSelectedCustomer(customer);
  };
  const handleConfigureInvoice = (customer: Customer) => {
    setActiveModal('invoice');  // Alterando para 'invoice' ao abrir o modal de gerar NF
    setSelectedCustomer(customer);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    if (selectedCustomer!.user.senhaelotech === 'undefined') { toast.error('Chave de homologação/Produção inválida!'); return; };
    if (selectedCustomer!.inscricaoMunicipal === '') { toast.error('Inscrição Municipal inválida!'); return; };

    const data = {
      customer_id: selectedCustomer._id,
      billing_day: subscription.billingDay,
      start_date: subscription.startDate,
      end_date: subscription.endDate,
      data: {
        servico: {
          Discriminacao: invoice.discriminacao,
          descricao: invoice.descricao,
          item_lista: parseFloat(invoice.item_lista),
          cnae: parseFloat(invoice.cnae),
          quantidade: parseFloat(invoice.quantidade.toString()),
          valor_unitario: parseFloat(invoice.valor_unitario.toString()),
          desconto: parseFloat(invoice.desconto.toString())
        }
      },
      valor: parseFloat(invoice.quantidade.toString()) * parseFloat(invoice.valor_unitario.toString()),
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
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    if (selectedCustomer!.user.senhaelotech === 'undefined') { toast.error('Chave de homologação/Produção inválida!'); return; };
    if (selectedCustomer!.inscricaoMunicipal === '') { toast.error('Inscrição Municipal inválida!'); return; };

    const data = {
      customer_id: selectedCustomer._id,
      servico: {
        Discriminacao: invoice.discriminacao,
        descricao: invoice.descricao,
        item_lista: parseFloat(invoice.item_lista),
        cnae: parseFloat(invoice.cnae),
        quantidade: parseFloat(invoice.quantidade.toString()),
        valor_unitario: parseFloat(invoice.valor_unitario.toString()),
        desconto: parseFloat(invoice.desconto.toString()),
        issueDate: invoice.issueDate,
        dateOfCompetence: invoice.dateOfCompetence,
      }
    }

    //console.log(data);

    try {
      if (selectedCustomer.status === 'active') {
        setIsGerating(true);
        const response = await api.create_invoice(data);
        toast.success(response.message);
        setActiveModal('none');
        setIsGerating(false);
      } else {
        toast.success('O contrato está inativo!');
      }
    } catch (error: any) {
      setIsGerating(false);
    }
  };

  function parseNfseXml(xmlString: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const nsResolver = (prefix: string | null) => (prefix === "ns2" ? "http://shad.elotech.com.br/schemas/iss/nfse_v2_03.xsd" : null);

    const getValue = (xpath: string) => {
      const result = xmlDoc.evaluate(xpath, xmlDoc, nsResolver, XPathResult.STRING_TYPE, null);
      return result.stringValue || null;
    };

    return {
      numeroNota: getValue("//ns2:InfNfse/ns2:Numero"),
      cpfCnpj: getValue("//ns2:PrestadorServico/ns2:IdentificacaoPrestador/ns2:CpfCnpj/ns2:Cnpj"),
      inscricaoMunicipal: getValue("//ns2:PrestadorServico/ns2:IdentificacaoPrestador/ns2:InscricaoMunicipal"),
      codigoMunicipio: getValue("//ns2:PrestadorServico/ns2:Endereco/ns2:CodigoMunicipio"),
      chaveAcesso: getValue("//ns2:InfNfse/ns2:ChaveAcesso"),
      codigoVerificacao: getValue("//ns2:InfNfse/ns2:CodigoVerificacao"),
    };
  }

  const handleCancelInvoice = async (invoice: any) => {

    if (!window.confirm("Tem certeza que deseja cancelar esta nota fiscal?")) {
      return;
    }

    try {
      const nfseData = parseNfseXml(invoice.xml);

      const data = {
        IdInvoice: invoice._id,
        NumeroNfse: nfseData.numeroNota,
        CpfCnpjNfse: nfseData.cpfCnpj,
        InscricaoMunicipalNfse: nfseData.inscricaoMunicipal,
        CodigoMunicipioNfse: nfseData.codigoMunicipio,
        ChaveAcesso: nfseData.chaveAcesso,
      }

      const response = await api.cancel_invoice(data);
      toast.success(response.message);
    } catch (error) {
      toast.error('Erro ao cancelar nota fiscal');
      console.error('Erro ao cancelar nota fiscal:', error);
    }
  }

  const handleModalReplaceInvoice = async (invoice: any) => {
    setActiveModal('replace');
    setHandleInvoice(invoice);
  }

  const handleReplaceInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.confirm("Tem certeza que deseja substituir esta nota fiscal?")) {
      return;
    }

    try {
      const nfseData = await parseNfseXml(handleinvoice.xml);

      const data = {
        IdInvoice: handleinvoice._id,
        customer_id: handleinvoice.customer,
        servico: {
          Discriminacao: invoice.discriminacao,
          descricao: invoice.descricao,
          item_lista: invoice.item_lista,
          cnae: invoice.cnae,
          quantidade: invoice.quantidade,
          valor_unitario: invoice.valor_unitario,
          desconto: invoice.desconto
        },
        numeroNfse: nfseData.numeroNota,
        CodigoMunicipio: nfseData.codigoMunicipio,
        ChaveAcesso: nfseData.chaveAcesso,
        NumeroLote: handleinvoice.numeroLote,
        IdentificacaoRpsnumero: handleinvoice.identificacaoRpsnumero,
      }

      const response = await api.replace_invoice(data);
      toast.success(response.message);
    } catch (error) {
      toast.error('Erro ao substituir nota fiscal');
      console.error('Erro ao substituir nota fiscal:', error);
    }
  }

  const handleViewModalEditCustomer = async (customer: Customer) => {
    if(customer.cpf != 'undefined' && customer.cnpj === 'undefined') {
      setActiveModal('editpessoafisica');
      setNewCustomer(customer);
    }
    if(customer.cpf === 'undefined' && customer.cnpj != 'undefined') {
      setActiveModal('edit');
      setNewCustomer(customer);
    }
  }

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.update_customer(newCustomer._id, newCustomer);
      toast.success('Cliente atualizado com sucesso!');
      location.reload();
    } catch (error) {
      toast.error('Erro ao atualizar cliente');
      console.error('Erro ao atualizar cliente:', error);
    }

  }

  const filteredCustomers = customers.filter(customer =>
    customer.cpf.includes(searchTerm) ||
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

  const closeAllModals = () => {
    setActiveModal('none');  // Fechando todos os modais
    setSchedulings([]);
  };

  const loadCustomers = async () => {
    try {
      const data = await api.find_customers_user();
      setCustomers(data || []);
      const cnaes = await api.Find_CNAES_ELOTECH();
      setCnaes(cnaes || []);
    } catch (error) {
      toast.error('Server error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvoiceHistory = async (id: string) => {
    try {
      const scheduledata = await api.find_schedulings(id);
      setSchedulings(scheduledata || []);
    } catch (error) {
      toast.error('Erro ao buscar agendamentos do cliente');
    }
  }

  function downloadCustomerXml(customer: any) {
    const blob = new Blob([customer.xml], { type: 'application/xml' });
    const fileName = `${customer.data.Rps.Servico.Discriminacao}_nota.xml`;
    saveAs(blob, fileName);
  }

  async function criarNotaFiscal(customer: any) {
  
        //console.log(customer);
  
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(customer.xml, "text/xml");
  
        const getValue = (tagName: string) => {
          const element = xmlDoc.getElementsByTagName(tagName)[0];
          return element ? element.textContent || "" : "N/A";
        };
  
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
        drawText(`Número: ${getValue("ns2:Numero")}`, 50, 780);
        drawText(`Data Prestação: ${getValue("ns2:DataEmissao")}`, 250, 780);
        drawText(`Autenticidade: ${getValue("ns2:CodigoVerificacao")}`, 450, 780);
        drawText('SITE AUTENTICIDADE: https://medianeira.oxy.elotech.com.br/iss/autenticar-documento-fiscal', 50, 765, 8);
  
        // Dados do prestador
        drawText('DADOS DO PRESTADOR DO SERVIÇO', 50, 740, 11);
        drawText(`Nome/Razão Social: ${getValue("ns2:RazaoSocial")}`, 50, 725);
        drawText(`CNPJ: ${getValue("ns2:Cnpj")}`, 50, 710);
        drawText(`Insc. Municipal: ${getValue("ns2:InscricaoMunicipal")}`, 50, 695);
        drawText(`Endereço: ${getValue("ns2:Endereco")}, ${getValue("ns2:Numero")}`, 50, 680);
        drawText(`Município/UF: ${getValue("ns2:CodigoMunicipio")}-${getValue("ns2:Uf")} | CEP: ${getValue("ns2:Cep")}`, 50, 665);
        drawText(`Fone: ${getValue("ns2:Telefone")} | E-mail: ${getValue("ns2:Email")}`, 50, 650);
  
        // Dados do tomador
        drawText('DADOS DO TOMADOR DO SERVIÇO', 50, 625, 11);
        drawText(`Nome/Razão Social: ${customer.data.Rps.Tomador.RazaoSocial || 'N/A'}`, 50, 610);
        drawText(`CPF/CNPJ: ${customer.data.Rps.Tomador.IdentificacaoTomador.CpfCnpj || 'N/A'}`, 50, 595);
        drawText(`Endereço: ${customer.data.Rps.Tomador.Endereco.Endereco}, ${customer.data.Rps.Tomador.Endereco.Numero} - ${customer.data.Rps.Tomador.Endereco.Bairro}`, 50, 580);
        drawText(`Município/UF: ${customer.data.Rps.Tomador.Endereco.CodigoMunicipio}-${customer.data.Rps.Tomador.Endereco.Uf} | CEP: ${customer.data.Rps.Tomador.Endereco.Cep}`, 50, 565);
        drawText(`Fone: ${customer.data.Rps.Tomador.Contato.Telefone || 'N/A'} | E-mail: ${customer.data.Rps.Tomador.Contato.Email || 'N/A'}`, 50, 550);
  
        // Serviço
        drawText('DEFINIÇÃO DO SERVIÇO', 50, 525, 11);
        drawText(`Item da Lista de Serviços: ${getValue("ns2:ItemListaServico")} ${getValue("ns2:Descricao")}`, 50, 510);
        drawText(`CNAE: ${getValue("ns2:CodigoCnae")} | Competência: ${getValue("ns2:Competencia")}`, 50, 495);
        drawText(`Local da Prestação: ${getValue("ns2:CodigoMunicipio")}-${getValue("ns2:Uf")}`, 50, 480);
        drawText('Natureza da Operação: EXIGÍVEL', 50, 465);
  
        // Discriminação
        drawText('DISCRIMINAÇÃO DO SERVIÇO', 50, 440, 11);
        drawText(`- ${getValue("ns2:Discriminacao")}`, 50, 425);
        drawText(`Descrição: ${getValue("ns2:Descricao")} | Qtde: ${getValue("ns2:Quantidade")} | Valor Unitário: R$ ${getValue("ns2:ValorUnitario")} | Valor Total: R$ ${getValue("ns2:ValorServicos")}`, 50, 410);
  
        // Tributos
        drawText('TRIBUTOS INCIDENTES', 50, 380, 11);
        drawText(`ISSQN: R$ ${getValue("ns2:ValorIss")} | Alíquota: ${getValue("ns2:Aliquota")}% | Retido: ${getValue("ns2:IssRetido") === "2" ? "Não" : "Sim"}`, 50, 365);
  
        // Totais
        drawText('TOTALIZAÇÃO DO DOCUMENTO FISCAL', 50, 320, 11);
        drawText(`Base de Cálculo ISSQN: R$ ${getValue("ns2:BaseCalculo")}`, 50, 305);
        drawText(`Valor Total: R$ ${getValue("ns2:ValorServicos")} | Descontos: R$ ${getValue("ns2:DescontoIncondicionado")} | Valor Líquido: R$ ${getValue("ns2:ValorLiquidoNfse")}`, 50, 290);
  
        // Assinatura
        drawText(`Recebemos de ${getValue("ns2:RazaoSocial")} os serviços constantes nesta NFS-e.`, 50, 260);
        drawText('DATA: ____/____/_____   Assinatura: ____________________________', 50, 240);
  
        // Salvar
        const pdfBytes = await pdfDoc.save();
        saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "modelo-nota-fiscal.pdf");
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(()=>{
    const fetchItemServico = async () => {
      try {
        if(!invoice.cnae) return;
        const response = await api.Find_SERVICO_POR_CNAE(invoice.cnae);
        setItemServico(response || []);
      } catch (error) {
        toast.error('Erro ao buscar item de serviço');
      }
    };

    fetchItemServico();
  },[invoice.cnae])

  //console.log(invoiceHistory);
 
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">CNPJ/CPF</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="border-t border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{customer.name || customer.razaoSocial}</td>
                    <td className="py-3 px-4 text-gray-600">{customer.cnpj === 'undefined' ? customer.cpf : customer.cnpj}</td>
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


                        <button
                          onClick={() => handleViewScheduleHistory(customer._id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Gerenciar agendamentos"
                        >
                          <Clock className="w-5 h-5" />
                        </button>


                      <button
                        onClick={() => handleViewInvoiceHistory(customer)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver Histórico"
                      >
                        <FaEye /> {/* Ícone de olho */}
                      </button>


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

                      {/* BOTAO EDITAR */}
                      <button
                        onClick={() => handleViewModalEditCustomer(customer)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Editar Cliente"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      {!invoiceHistory.some(invoice => invoice.customer_id === customer._id) && (
                        <button
                          onClick={() => handleDeleteCustomer(customer._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
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

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecione uma Opção</label>
              <select
              value={SelectType}
              onChange={(e) => setSelectType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              <option value="Empresa">Pessoa Jurídica</option>
              <option value="Pessoa Física">Pessoa Física</option>
              </select>
            </div>

            {SelectType === 'Pessoa Física' ? (
            <div className="p-6 overflow-y-auto flex-1">
            <form id="newCustomerForm" onSubmit={handleAddCustomer} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF {loadingCnpj && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                  </label>
                  <input
                    type="text"
                    value={newCustomer.cpf}
                    onChange={(e) => setNewCustomer({ ...newCustomer, cpf: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${cnpjError ? 'border-red-500' : 'border-gray-300'
                      }`}
                    required
                    placeholder="000.000.000-00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={newCustomer.razaoSocial}
                    onChange={(e) => setNewCustomer({ ...newCustomer, razaoSocial: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>            
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
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
                    required
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
                    required
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <input
                  type="text"
                  value={newCustomer.address.state}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().slice(0, 2); // Allow only two uppercase letters
                    setNewCustomer({
                    ...newCustomer,
                    address: { ...newCustomer.address, state: value },
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código do Município (IBGE)
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
                    required
                  />
                </div>
              </div>
            </form>
            </div>
            ) : 
            <div className="p-6 overflow-y-auto flex-1">
              <form id="newCustomerForm" onSubmit={handleAddCustomer} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ {loadingCnpj && <Loader2 className="inline w-4 h-4 ml-2 animate-spin" />}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.cnpj}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cnpj: formatCnpj(e.target.value) })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${cnpjError ? 'border-red-500' : 'border-gray-300'
                        }`}
                      required
                      placeholder="00.000.000/0000-00"
                    />
                    {cnpjError && <p className="mt-1 text-sm text-red-600">{cnpjError}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
                    <input
                      type="text"
                      value={newCustomer.inscricaoMunicipal || ''}
                      onChange={(e) => setNewCustomer({ ...newCustomer, inscricaoMunicipal: e.target.value })}
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
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                      required
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
                      required
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
                      required
                    />
                  </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      type="text"
                      value={newCustomer.address.state}
                      onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 2); // Allow only two uppercase letters
                      setNewCustomer({
                        ...newCustomer,
                        address: { ...newCustomer.address, state: value },
                      });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código do Município (IBGE)
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
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
            }
            

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handleCloseModal()}
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

      {/* Modal de Editar Cliente */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Editar Cliente</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form
                id="editCustomerForm"
                onSubmit={(e) => handleEditCustomer(e)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      placeholder={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      placeholder={newCustomer.cnpj}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cnpj: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
                    <input
                      type="text"
                      placeholder={newCustomer.inscricaoMunicipal}
                      onChange={(e) => setNewCustomer({ ...newCustomer, inscricaoMunicipal: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      placeholder={newCustomer.phone}
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
                      placeholder={newCustomer.address.street}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, street: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      placeholder={newCustomer.address.number}
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
                      placeholder={newCustomer.address.neighborhood}
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
                      placeholder={newCustomer.address.city}
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
                      placeholder={newCustomer.address.state}
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
                      placeholder={newCustomer.address.zipCode}
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
                      placeholder={newCustomer.address.cityCode}
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
                onClick={closeAllModals}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="editCustomerForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'editpessoafisica' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Editar Cliente</h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form
                id="editCustomerForm"
                onSubmit={(e) => handleEditCustomer(e)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder={newCustomer.cpf}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cpf: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razao Social
                    </label>
                    <input
                      type="text"
                      placeholder={newCustomer.razaoSocial}
                      onChange={(e) => setNewCustomer({ ...newCustomer, razaoSocial: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      placeholder={newCustomer.phone}
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
                      placeholder={newCustomer.address.street}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: { ...newCustomer.address, street: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      placeholder={newCustomer.address.number}
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
                      placeholder={newCustomer.address.neighborhood}
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
                      placeholder={newCustomer.address.city}
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
                      placeholder={newCustomer.address.state}
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
                      placeholder={newCustomer.address.zipCode}
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
                      placeholder={newCustomer.address.cityCode}
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
                onClick={closeAllModals}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="editCustomerForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico de Notas Fiscais */}
      {selectedCustomer && activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[70%] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Histórico de Notas Fiscais</h2>
              <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-800">{selectedCustomer.name}</h3>
              <table className="mt-4 w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Descrição</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Valor</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Data</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-2 px-4 text-center text-sm text-gray-500">Nenhuma nota fiscal encontrada</td>
                    </tr>
                  ) : (
                    invoiceHistory.map((invoice) => (               
                      <tr key={invoice.id} className="border-b">
                        <td className="py-2 px-4 text-sm text-gray-700">{invoice.status || ''}</td>
                        <td className="py-2 px-4 text-sm text-gray-700">{invoice.data.Rps.Servico.Discriminacao || ''}</td>
                        <td className="py-2 px-4 text-sm text-gray-700">{invoice.valor * invoice.data.Rps.Servico.ListaItensServico[0].Quantidade}</td>
                        <td className="py-2 px-4 text-sm text-gray-700">
                          {new Date(invoice.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          }) || ''}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
{/*                           <button
                            onClick={() => handleModalReplaceInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Substituir Nota Fiscal"
                          >
                            <File className="w-4 h-4" />
                          </button> */}
                          <button
                            onClick={() => downloadCustomerXml(invoice)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Baixar XML"
                          >
                            <FileCodeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => criarNotaFiscal(invoice)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Baixar PDF"
                          >
                            <File className="w-4 h-4" />
                          </button>
                          {(invoice.status === 'emitida' || invoice.status === 'substituida') && (
                            <button
                              onClick={() => handleCancelInvoice(invoice)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Cancelar Nota Fiscal"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                              onClick={() => navigator.clipboard.writeText(`https://www.aginotas.com.br/${invoice._id}`)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="Copiar Link"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração de Agendamento */}
      {activeModal === 'subscription' && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Emita suas Notas de Forma Programada</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="subscriptionForm" onSubmit={handleSaveSubscription} className="space-y-4">
              <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                    <input
                    type="text"
                    list="cnae-options"
                    value={invoice.cnae || ''}
                    onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione um CNAE"
                    required
                    />
                    <datalist id="cnae-options">
                    {cnaes.map((cnae) => (
                      <option key={cnae.codigo} value={cnae.codigo}>
                      {cnae.codigo} -- {cnae.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serviço LC</label>
                  <select
                  value={invoice.item_lista}
                  onChange={(e) => setInvoice({ ...invoice, item_lista: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="" disabled>Selecione um serviço</option>
                  {itemservico.map((item, index) => (
                    <option key={index} value={item.listaServicoVo.id}>
                    {item.listaServicoVo.id}
                    </option>
                  ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                    <input
                    type="text"
                    list="descricao-options"
                    value={invoice.descricao}
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione uma descrição"
                    required
                    />
                    <datalist id="descricao-options">
                    {itemservico.map((item, index) => (
                      <option key={index} value={item.listaServicoVo.descricao}>
                      {item.listaServicoVo.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação</label>
                  <input
                    type="text"
                    value={invoice.discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={invoice.quantidade || 0}
                    onChange={(e) => setInvoice({ ...invoice, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <input
                    type="text"
                    value={invoice.valor_unitario}
                    placeholder='ex: 1600.90'
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); // Remove commas
                      setInvoice({ ...invoice, valor_unitario: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="text"
                    value={invoice.desconto}
                    placeholder='0'
                    onChange={(e) => setInvoice({ ...invoice, desconto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia do Faturamento</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={subscription.startDate}
                    onChange={(e) => setSubscription({ ...subscription, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
                  <input
                    type="date"
                    value={subscription.endDate}
                    onChange={(e) => setSubscription({ ...subscription, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </form>


              {/* Campos para configurar assinatura */}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={closeAllModals} className="px-4 py-2 text-gray-700 hover:text-gray-900">
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
      {activeModal === 'invoice' && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gerar Nota Fiscal</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="invoiceForm" onSubmit={handleGenerateInvoice} className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                    <input
                    type="text"
                    list="cnae-options"
                    value={invoice.cnae || ''}
                    onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione um CNAE"
                    required
                    />
                    <datalist id="cnae-options">
                    {cnaes.map((cnae) => (
                      <option key={cnae.codigo} value={cnae.codigo}>
                      {cnae.codigo} - {cnae.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Serviço</label>
                  <select
                  value={invoice.item_lista}
                  onChange={(e) => setInvoice({ ...invoice, item_lista: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  >
                  <option value="" disabled>Selecione um serviço</option>
                  {itemservico.map((item, index) => (
                    <option key={index} value={item.listaServicoVo.id}>
                    {item.listaServicoVo.id}
                    </option>
                  ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                    <input
                    type="text"
                    list="descricao-options"
                    value={invoice.descricao}
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite ou selecione uma descrição"
                    required
                    />
                    <datalist id="descricao-options">
                    {itemservico.map((item, index) => (
                      <option key={index} value={item.listaServicoVo.descricao}>
                      {item.listaServicoVo.descricao}
                      </option>
                    ))}
                    </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação</label>
                  <input
                    type="text"
                    value={invoice.discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={invoice.quantidade}
                    onChange={(e) => setInvoice({ ...invoice, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <input
                    type="text"
                    value={invoice.valor_unitario}
                    placeholder='ex: 1600.90'
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); // Remove commas
                      setInvoice({ ...invoice, valor_unitario: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="text"
                    value={invoice.desconto}
                    onChange={(e) => setInvoice({ ...invoice, desconto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder='0'
                  />
                </div>

{/*                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Competência</label>
                  <input
                    type="date"
                    value={invoice.dateOfCompetence}
                    onChange={(e) => setInvoice({ ...invoice, dateOfCompetence: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={closeAllModals} className="px-4 py-2 text-gray-700 hover:text-gray-900">
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

      {/* Modal Substituir Nota Fiscal */}
      {activeModal === 'replace' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Substituir Nota Fiscal</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="invoiceReplaceForm" onSubmit={handleReplaceInvoice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discriminação do Serviço</label>
                  <input
                    type="text"
                    placeholder={handleinvoice.data.Rps.Servico.Discriminacao || ''}
                    onChange={(e) => setInvoice({ ...invoice, discriminacao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNAE</label>
                  <input
                    type="text"
                    placeholder={handleinvoice.data.Rps.Servico.ListaItensServico[0].CodigoCnae || ''}
                    onChange={(e) => setInvoice({ ...invoice, cnae: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item da Lista de Serviço</label>
                  <input
                    type="text"
                    placeholder={handleinvoice.data.Rps.Servico.ListaItensServico[0].ItemListaServico}
                    onChange={(e) => setInvoice({ ...invoice, item_lista: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço</label>
                  <textarea
                    placeholder={handleinvoice.data.Rps.Servico.ListaItensServico[0].Descricao || ''}
                    onChange={(e) => setInvoice({ ...invoice, descricao: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    placeholder={(handleinvoice.data.Rps.Servico.ListaItensServico[0].Quantidade).toString()}
                    onChange={(e) => setInvoice({ ...invoice, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                  <input
                    type="text"
                    value={invoice.valor_unitario}
                    placeholder="ex: 1600.90"
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); // Remove commas
                      setInvoice({ ...invoice, valor_unitario: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="text"
                    value={invoice.desconto}
                    onChange={(e) => setInvoice({ ...invoice, desconto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

                  />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={closeAllModals} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                Cancelar
              </button>
              <button
                type="submit"
                form="invoiceReplaceForm"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={isGerating}
              >
                {isGerating ? 'Substituindo...' : 'Substituir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamentos de Emissão Automatizada */}
      {activeModal === 'scheduling' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Agendamentos de Emissão Automatizada</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {schedulings.length === 0 ? (
                <div className="text-center text-gray-500">Nenhum agendamento encontrado.</div>
              ) : (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      {/* <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Cliente</th> */}
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Descrição</th>
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Dia do Faturamento</th>
                      <th className="py-2 px-4 text-right text-sm font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedulings.map((schedule) => (
                      <tr key={schedule.customer_id} className="border-b">
                        {/* <td className="py-2 px-4 text-sm text-gray-700">{schedule?.name || schedule?.razaoSocial}</td> */}
                        <td className="py-2 px-4 text-sm text-gray-700">{schedule.data?.servico?.Discriminacao || ''}</td>
                        <td className="py-2 px-4 text-sm text-gray-700">{schedule.billing_day}</td>
                        <td className="py-2 px-4 text-right">
                        <button
                          onClick={() => handleCancelSchedule(schedule.customer_id)}
                          className="text-red-600 hover:text-red-800"
                          title="Cancelar Agendamento"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={closeAllModals}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}