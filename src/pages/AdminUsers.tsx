import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { CircularProgress, Modal, Box, Typography, Button } from '@mui/material';
import { Visibility as VisibilityIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { api } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  subscription: string;
  paymentStatus: 'paid' | 'unpaid';
  active: boolean;
  registrationDate: string;
  usageTime: string;
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [infoSubscription, setInfoSubscription] = useState<any>(null);


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
  }

  useEffect(()=>{
    loadData();
  },[])

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  console.log(infoSubscription);

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
          </tr>
        </thead>
        <tbody>
          {usersDB.map((user) => (
            <tr key={user._id} className="border-b border-gray-200">
              <td className="p-2 md:p-4">{user.name}</td>
              <td className="p-2 md:p-4 hidden sm:table-cell">{user.email}</td>      
              <td className="p-2 md:p-4">
                {user.status ? (
                  <span className="text-green-500">Ativo</span>
                ) : (
                  <span className="text-red-500">Inativo</span>
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

    <Modal open={openModal} onClose={handleCloseModal}>
      <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90%',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}
      >
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Detalhes completos do Usuário
      </Typography>
      {infoSubscription && (
        <div>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Informações da Assinatura
        </Typography>
        <p><strong>ID da Assinatura:</strong> {infoSubscription.id}</p>
        <p><strong>Status:</strong> {infoSubscription.status}</p>
        <p><strong>Data de Criação:</strong> {new Date(infoSubscription.created_at).toLocaleDateString()}</p>
        <p><strong>Data de Cancelamento:</strong> {infoSubscription.canceled_at ? new Date(infoSubscription.canceled_at).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Início:</strong> {new Date(infoSubscription.start_at).toLocaleDateString()}</p>
        <p><strong>Intervalo:</strong> {infoSubscription.interval} ({infoSubscription.interval_count})</p>
        <p><strong>Dia de Cobrança:</strong> {infoSubscription.billing_day}</p>
        <p><strong>Método de Pagamento:</strong> {infoSubscription.payment_method}</p>
        <p><strong>Plano:</strong> {infoSubscription.plan?.name}</p>
        <p><strong>Cliente:</strong> {infoSubscription.customer?.name} ({infoSubscription.customer?.email})</p>
        <p><strong>Moeda:</strong> {infoSubscription.currency}</p>
        <p><strong>Descrição no Extrato:</strong> {infoSubscription.statement_descriptor}</p>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Detalhes do Cliente
        </Typography>
        <p><strong>ID do Cliente:</strong> {infoSubscription.customer?.id}</p>
        <p><strong>Nome:</strong> {infoSubscription.customer?.name}</p>
        <p><strong>Email:</strong> {infoSubscription.customer?.email}</p>
        <p><strong>Tipo:</strong> {infoSubscription.customer?.type}</p>
        <p><strong>Documento:</strong> {infoSubscription.customer?.document}</p>
        <p><strong>Tipo de Documento:</strong> {infoSubscription.customer?.document_type}</p>
        <p><strong>Delinquente:</strong> {infoSubscription.customer?.delinquent ? 'Sim' : 'Não'}</p>
        <p><strong>Telefone Residencial:</strong> {infoSubscription.customer?.phones?.home_phone?.country_code} {infoSubscription.customer?.phones?.home_phone?.area_code} {infoSubscription.customer?.phones?.home_phone?.number}</p>
        <p><strong>Telefone Celular:</strong> {infoSubscription.customer?.phones?.mobile_phone?.country_code} {infoSubscription.customer?.phones?.mobile_phone?.area_code} {infoSubscription.customer?.phones?.mobile_phone?.number}</p>
        <p><strong>Criado em:</strong> {new Date(infoSubscription.customer?.created_at).toLocaleDateString()}</p>
        <p><strong>Atualizado em:</strong> {new Date(infoSubscription.customer?.updated_at).toLocaleDateString()}</p>

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
          Detalhes do Cartão
        </Typography>
        <p><strong>Marca:</strong> {infoSubscription.card?.brand}</p>
        <p><strong>ID do Cartão:</strong> {infoSubscription.card?.id}</p>
        <p><strong>Primeiros Seis Dígitos:</strong> {infoSubscription.card?.first_six_digits}</p>
        <p><strong>Últimos Quatro Dígitos:</strong> {infoSubscription.card?.last_four_digits}</p>
        <p><strong>Nome do Titular:</strong> {infoSubscription.card?.holder_name}</p>
        <p><strong>Status:</strong> {infoSubscription.card?.status}</p>
        <p><strong>Tipo:</strong> {infoSubscription.card?.type}</p>
        <p><strong>Mês de Expiração:</strong> {infoSubscription.card?.exp_month}</p>
        <p><strong>Ano de Expiração:</strong> {infoSubscription.card?.exp_year}</p>
        <p><strong>Criado em:</strong> {new Date(infoSubscription.card?.created_at).toLocaleDateString()}</p>
        <p><strong>Atualizado em:</strong> {new Date(infoSubscription.card?.updated_at).toLocaleDateString()}</p>
        </div>
      )}
      </Box>
    </Modal>
  </div>
);
}