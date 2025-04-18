import React, { useState, useEffect } from 'react';
import { ToggleRight } from 'lucide-react';
import { CircularProgress, Modal, Box, Typography, Button, ButtonGroup } from '@mui/material';
import { Visibility as VisibilityIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { api } from '../lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  cnpj: string;
  name: string;
  email: string;
  subscription: string;
  paymentStatus: 'paid' | 'unpaid';
  active: boolean;
  registrationDate: string;
  usageTime: string;
  _id: string;
  cpf: string;
  razaoSocial: string;
  nomeFantasia: string;
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

interface UserDB {
  _id: string;
  subscription_id: string;
  senhaelotech: string;
  name: string;
  inscricaoMunicipal: string;
  id_client_pagarme: string;
  homologa: boolean;
  estado: string;
  email: string;
  date_created: string;
  cnpj: string;
  cidade: string;
  RegimeEspecialTributacao: number;
  IncentivoFiscal: number;
  status: string;
}

export function AdminUsers() {

  const [usersDB, setUsersDB] = useState<UserDB[]>([]);
  const [cnaes, setCnaes] = useState<any[]>([]);
  const [itemservico, setItemServico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [infoSubscription, setInfoSubscription] = useState<any>(null);
  const [isGerating, setIsGerating] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'edit' | 'editpessoafisica' | 'invoice' | 'replace' | 'subscription' | 'scheduling' | 'history'> ('none');
  const open = Boolean(anchorEl);
  const [cnpjError, setCnpjError] = useState('');
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  const adminDataString = localStorage.getItem('admin');
  const adminData = adminDataString ? JSON.parse(adminDataString) : null;

  const handleClick = (event:any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const [invoice, setInvoice] = useState({
    discriminacao: '',
    descricao: '',
    item_lista: '',
    aliquota_item_lista: 0,
    cnpj: selectedUser?.cnpj || "",
    cnae: '',
    quantidade: 1,
    valor_unitario: '',
    valor_deducao: '0',
    desconto: '0',
    DescontoIncondicionado: '0',
    DescontoCondicionado: '0',
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

    tomador:{
      cnpjcpf: '',
      InscricaoMunicipal:'',
      RazaoSocial: '',
      Endereco:'',
      Numero:'',
      Bairro:'',
      CodigoMunicipio:'',
      Uf:'',
      Cep:'',
      Telefone:'',
      Email:'',
    },
    // Novos campos adicionados:
    anexo: '',
    rbt12: '',
    aliquotas: {
      aliquota: 0,
      iss: '',
      cofins: '',
      ir: '',
      cpp: '',
      pis: '',
      inss: '',
      csll: '',
      outras: ''
    },
    valores: {
      iss: '',
      cofins: '',
      ir: '',
      cpp: '',
      pis: '',
      inss: '',
      csll: '',
      outras: ''
    },
    retido: {
      iss: false,
      cofins: false,
      ir: false,
      cpp: false,
      pis: false,
      inss: false,
      csll: false,
      outras: false
    },
  });  

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

  const handleOpenModal = async (user: any) => {
    try {
      const infoSubscription = await api.find_subscription(user.subscription_id);
      setInfoSubscription(infoSubscription);
      setSelectedUser(user);
      setOpenModal(true); 

    } catch (error) {
      console.error('Error fetching subscription info:', error);
      setOpenModal(false);
    }
  
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser({});
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUserId(null);
  };

  const loadData = async () => {
    const allusers = await api.find_all_users();
    setUsersDB(allusers);
    const cnaes = await api.Find_CNAES_ELOTECH();
    setCnaes(cnaes || []);
  }

  const handleUpdateUser = async (user:any) => {
    try {
      if(user.status === 'active'){
        await api.update_user_byID(user._id, {status: 'inactive'});
        toast.success("Usuário atualizado com sucesso!");
        loadData();
      }
      if(user.status === 'inactive'){
        await api.update_user_byID(user._id, {status: 'active'});
        toast.success("Usuário atualizado com sucesso!");
        loadData();
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao atualizar!");
    }
  }

  const handleViewGenerateNfse = async (data:any) =>{
    setOpenModal(false);
    setActiveModal('invoice');
    console.log(data);
  }

  const closeAllModals = () => {
    setActiveModal('none');  // Fechando todos os modais
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminData) return;

    if (adminData!.senhaelotech === 'undefined') { toast.error('Chave de homologação/Produção inválida!'); return; };
    if (adminData!.inscricaoMunicipal === '') { toast.error('Inscrição Municipal inválida!'); return; };

    const data = {
      customer: invoice.tomador,
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
        ValorDeducoes: parseFloat(invoice.valor_deducao),
        AliquotaPis:  parseFloat(invoice.aliquotas.pis),
        RetidoPis: invoice.retido.pis ? 1 : 2,
        ValorPis: parseFloat(invoice.valores.pis), 
        AliquotaCofins: parseFloat(invoice.aliquotas.cofins),
        RetidoCofins: invoice.retido.cofins ? 1 : 2,
        ValorCofins: parseFloat(invoice.valores.cofins), 
        AliquotaInss: parseFloat(invoice.aliquotas.inss),
        RetidoInss: invoice.retido.inss ? 1 : 2,
        ValorInss: parseFloat(invoice.valores.inss),
        AliquotaIr: parseFloat(invoice.aliquotas.ir), 
        RetidoIr: invoice.retido.ir ? 1 : 2, 
        ValorIr: parseFloat(invoice.valores.ir),
        AliquotaCsll: parseFloat(invoice.aliquotas.csll),
        RetidoCsll: invoice.retido.csll ? 1 : 2,
        ValorCsll: parseFloat(invoice.valores.csll),
        AliquotaCpp: parseFloat(invoice.aliquotas.cpp),
        RetidoCpp: invoice.retido.cpp ? 1 : 2,
        ValorCpp: parseFloat(invoice.valores.cpp),
        RetidoOutrasRetencoes: invoice.retido.outras ? 1 : 2,
        Aliquota: invoice.aliquotas.aliquota,
        DescontoIncondicionado: parseFloat(invoice.DescontoIncondicionado),
        DescontoCondicionado: parseFloat(invoice.DescontoCondicionado),
        IssRetido: invoice.retido.iss ? 1 : 2, 
      }
    }

    try {
      if (adminData) {
        setIsGerating(true);
        const response = await api.create_invoice_admin(data);
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

  const fetchCompanyData = async () => {
    const cleanedCnpj = invoice.tomador.cnpjcpf.replace(/\D/g, '');

    if (!validateCnpj(invoice.tomador.cnpjcpf) || cleanedCnpj.length !== 14) return;

    setLoadingCnpj(true);
    setCnpjError('');

    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanedCnpj}`);

      if (!response.ok) throw new Error('Erro na consulta');

      const data = await response.json();

      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.message || 'CNPJ não encontrado');
      }
      setInvoice({
        ...invoice,
        tomador:{
          cnpjcpf: invoice.tomador.cnpjcpf ? invoice.tomador.cnpjcpf.replace(/[.\/-]/g, '') : '',
          InscricaoMunicipal: invoice.tomador.InscricaoMunicipal || '',
          RazaoSocial: data.razao_social || '',
          Endereco: data.estabelecimento.logradouro|| '',
          Numero: data.estabelecimento.numero|| '',
          Bairro: data.estabelecimento.bairro|| '',
          CodigoMunicipio: data.estabelecimento.cidade.ibge_id|| '',
          Uf: data.estabelecimento.estado.sigla|| '',
          Cep: data.estabelecimento.cep|| '',
          Telefone: data.estabelecimento.telefone1|| '',
          Email: data.estabelecimento.email || '',          
        }
      })

    } catch (err) {
      console.error('Erro na consulta:', err);
      setCnpjError('Dados não encontrados. Preencha manualmente');

      setInvoice({
        ...invoice,
        tomador:{
          cnpjcpf: '',
          InscricaoMunicipal: '',
          RazaoSocial: '',
          Endereco: '',
          Numero:'',
          Bairro:'',
          CodigoMunicipio:'',
          Uf:'',
          Cep:'',
          Telefone:'',
          Email:'',          
        }
      })

    } finally {
      setLoadingCnpj(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (invoice.tomador.cnpjcpf.replace(/\D/g, '').length === 14) {
        fetchCompanyData();
      }
/*       if (newCustomer.cpf.replace(/\D/g, '').length === 11) {
        fetchPersonData();
      } */
    }, 1500);

    return () => clearTimeout(timer);
  }, [invoice.tomador.cnpjcpf]);

  useEffect(()=>{
    loadData();
  },[])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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

  useEffect(()=> {
    async function FetchTaxation() {
      if(invoice.anexo && invoice.rbt12){

        setInvoice(prevState => ({
          ...prevState, // Mantém todos os outros campos do estado
          aliquotas: {
            aliquota: 0,
            iss: '',
            cofins: '',
            ir: '',
            cpp: '',
            pis: '',
            inss: '',
            csll: '',
            outras: ''
          },
          valores: {
            iss: '',
            cofins: '',
            ir: '',
            cpp: '',
            pis: '',
            inss: '',
            csll: '',
            outras: ''
          },
        }));

      const response = await api.Calculate_Taxation({anexo:invoice.anexo, receitaBruta12Meses:invoice.rbt12});

      if(response){
      setInvoice(prevState => ({
        ...prevState, // Mantém todos os outros campos do estado
        aliquotas: {
          aliquota: invoice.aliquota_item_lista || 0,
          iss: ((response.distribuicao.ISS * response.aliquotaEfetiva) / 100).toString() || '0',
          cofins: ((response.distribuicao.COFINS * response.aliquotaEfetiva) / 100).toString() || '0',
          ir: ((response.distribuicao.IRPJ * response.aliquotaEfetiva)/ 100).toString() || '0',
          cpp: ((response.distribuicao.CPP * response.aliquotaEfetiva) / 100).toString() || '0',
          pis: ((response.distribuicao.PIS * response.aliquotaEfetiva) / 100).toString() || '0',
          inss: invoice.aliquotas.inss || '0',
          csll: ((response.distribuicao.CSLL * response.aliquotaEfetiva) / 100).toString() || '0',
          outras: invoice.aliquotas.outras || '0',
        },
        valores: {
          iss: (parseFloat(invoice.valor_unitario) * (response.distribuicao.ISS * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          cofins: (parseFloat(invoice.valor_unitario) * (response.distribuicao.COFINS * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          ir: (parseFloat(invoice.valor_unitario) * (response.distribuicao.IRPJ * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          cpp: (parseFloat(invoice.valor_unitario) * (response.distribuicao.CPP * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          pis: (parseFloat(invoice.valor_unitario) * (response.distribuicao.PIS * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          inss: invoice.valores.inss || '0',
          csll: (parseFloat(invoice.valor_unitario) * (response.distribuicao.CSLL * response.aliquotaEfetiva) / 10000).toFixed(2).toString() || '0',
          outras: invoice.valores.outras || '0',
        }
      }));
    }
    }
    }
    FetchTaxation();
  },[invoice.rbt12, invoice.anexo, invoice.valor_unitario])
  
  
  //console.log(adminData);

  return (
    <div className="p-4 md:p-8">
    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-gray-800">Gerenciamento de Usuários</h1>

    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 md:p-4 text-left">Nome</th>
            <th className="p-2 md:p-4 text-left hidden sm:table-cell">Email</th>
            <th className="p-2 md:p-4 text-left">Status</th>
            <th className="p-2 md:p-4 text-left">Ações</th>
            <th className="p-2 md:p-4 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {usersDB.map((user) => (
            <tr key={user._id} className="border-b border-gray-200">
              <td className="p-2 md:p-4">{user.name}</td>
              <td className="p-2 md:p-4 hidden sm:table-cell">{user.email}</td>      
              <td className="p-2 md:p-4">
                {user.status === 'active' ? (
                    <button onClick={()=> handleUpdateUser(user)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                    Desativar
                  </button>
                ) : (
                  <button onClick={()=> handleUpdateUser(user)} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                  Ativar
                </button>
                )}
              </td>
                <td className="p-2 md:p-4">
                <IconButton
                  aria-label="more"
                  aria-controls={`user-menu-${user._id}`}
                  aria-haspopup="true"
                  onClick={(event) => handleMenuOpen(event, user._id)}
                >
                  <MoreVertIcon />               
                </IconButton>
                <Menu
                  id={`user-menu-${user._id}`}
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl) && selectedUserId === user._id}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                  onClick={() => {
                    handleOpenModal(user);
                    handleMenuClose();
                  }}
                  >
                  <VisibilityIcon sx={{ mr: 1 }} />
                  Ver Detalhes
                  </MenuItem>               
                </Menu>
                </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>

      {/* Modal Gerar Nota Fiscal */}
      {activeModal === 'invoice' && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Gerar Nota Fiscal</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="invoiceForm" onSubmit={handleGenerateInvoice} className="space-y-4">
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ tomador</label>
                  {cnpjError && <p className="mt-1 text-sm text-red-600">{cnpjError}</p>}
                  <input
                    type="text"
                    placeholder='00.000.000/0000-00'
                    value={invoice.tomador.cnpjcpf || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        cnpjcpf: e.target.value
                      }
                    })}                  
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required                   
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">InscricaoMunicipal tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.InscricaoMunicipal || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        InscricaoMunicipal: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RazaoSocial tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.RazaoSocial || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        RazaoSocial: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereco tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Endereco || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Endereco: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>     
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numero tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Numero || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Numero: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Bairro || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Bairro: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>     
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CodigoMunicipio tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.CodigoMunicipio || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        CodigoMunicipio: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UF tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Uf || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Uf: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>   
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cep tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Cep || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Cep: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div> 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Telefone || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Telefone: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>        
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email tomador</label>
                  <input
                    type="text"
                    value={invoice.tomador.Email || ''}
                    onChange={(e) => setInvoice({...invoice,
                      tomador: {
                        ...invoice.tomador,
                        Email: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>                                                                           
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
                  onChange={(e) => {
                    const selectedItem = itemservico.find(item => item.listaServicoVo.id === e.target.value);
                    setInvoice({ 
                      ...invoice, 
                      item_lista: e.target.value,
                      aliquota_item_lista: selectedItem.listaServicoVo.aliquota // Armazena a descrição
                    });
                  }}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dedução</label>
                  <input
                    type="text"
                    value={invoice.valor_deducao}
                    placeholder='ex: 00.00'
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/,/g, ''); 
                      setInvoice({ ...invoice, valor_deducao: sanitizedValue });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                  <input
                    type="text"
                    value={invoice.desconto}
                    onChange={(e) => setInvoice({ ...invoice, desconto: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Condicionado</label>
                  <input
                    type="text"
                    value={invoice.DescontoCondicionado}
                    onChange={(e) => setInvoice({ ...invoice, DescontoCondicionado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'                       
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Incondicionado</label>
                  <input
                    type="text"
                    value={invoice.DescontoIncondicionado}
                    onChange={(e) => setInvoice({ ...invoice, DescontoIncondicionado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder='ex: 00.00'
                  />
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anexo do Simples Nacional</label>
                  <select
                    value={invoice.anexo}
                    onChange={(e) => setInvoice({ ...invoice, anexo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Selecione o Anexo</option>
                    <option value="III">ANEXO III</option>
                    <option value="IV">ANEXO IV</option>
                    <option value="V">ANEXO V</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receita Bruta dos últimos 12 meses (RBT12)</label>
                  <input
                    type="text"
                    value={invoice.rbt12}
                    onChange={(e) => setInvoice({ ...invoice, rbt12: e.target.value })}
                    placeholder="ex: 180000.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tributo</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Alíquota (%)</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Valor</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Retido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { nome: 'ISS', campo: 'iss' },
                        { nome: 'Cofins', campo: 'cofins' },
                        { nome: 'IR', campo: 'ir' },
                        { nome: 'CPP', campo: 'cpp' },
                        { nome: 'PIS', campo: 'pis' },
                        { nome: 'INSS', campo: 'inss' },
                        { nome: 'CSLL', campo: 'csll' },
                        { nome: 'Outras', campo: 'outras' }
                      ].map(({ nome, campo }) => (
                        <tr key={campo} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-700">{nome}</td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={invoice.aliquotas?.[campo] || ''}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                aliquotas: { ...invoice.aliquotas, [campo]: e.target.value }
                              })}
                              placeholder="%"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={invoice.valores?.[campo] || ''}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                valores: { ...invoice.valores, [campo]: e.target.value }
                              })}
                              placeholder="R$"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={invoice.retido?.[campo] || false}
                              onChange={(e) => setInvoice({
                                ...invoice,
                                retido: { ...invoice.retido, [campo]: e.target.checked }
                              })}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

    <Modal open={openModal} onClose={handleCloseModal}>
      <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 4,
      }}
      >
      <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
        Detalhes do Usuário
      </Typography>
      {infoSubscription ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', pb: 1 }}>
          Informações da Assinatura
        </Typography>
        <Typography><strong>ID da Assinatura:</strong> {infoSubscription.id}</Typography>
        <Typography><strong>Status:</strong> {infoSubscription.status}</Typography>
        <Typography><strong>Data de Criação:</strong> {new Date(infoSubscription.created_at).toLocaleDateString()}</Typography>
        <Typography><strong>Plano:</strong> {infoSubscription.plan?.name}</Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', mt: 3, pb: 1 }}>
          Detalhes do Cliente
        </Typography>
        <Typography><strong>Nome:</strong> {infoSubscription.customer?.name}</Typography>
        <Typography><strong>Email:</strong> {infoSubscription.customer?.email}</Typography>
        <Typography><strong>Documento:</strong> {infoSubscription.customer?.document}</Typography>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', mt: 3, pb: 1 }}>
          Detalhes do Cartão
        </Typography>
        <Typography><strong>Marca:</strong> {infoSubscription.card?.brand}</Typography>
        <Typography><strong>Últimos Dígitos:</strong> {infoSubscription.card?.last_four_digits}</Typography>
        <Typography><strong>Nome do Titular:</strong> {infoSubscription.card?.holder_name}</Typography>
        </Box>
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
        Nenhuma informação disponível.
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
        <div>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleClick}
            aria-controls="actions-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            Ações NFSE
          </Button>
          
          <Menu
            id="actions-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'actions-button',
            }}
          >
            <MenuItem onClick={() => {
              handleCloseMenu();
              handleViewGenerateNfse(selectedUserId);
            }}>
              Emitir NFSE
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseMenu();
              // Adicione aqui a função para NFSE Recorrente
            }}>
              NFSE Recorrente
            </MenuItem>
            <MenuItem onClick={() => {
              handleCloseMenu();
              // Adicione aqui a função para Emitir NFSE
            }}>
              Histórico NFSE
            </MenuItem>
          </Menu>
        </div>

        <Button variant="contained" color="primary" onClick={handleCloseModal}>
          Fechar
        </Button>
      </Box>
      </Box>
    </Modal>
  </div>
);
}