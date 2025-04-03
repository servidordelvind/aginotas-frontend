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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button variant="contained" color="primary" onClick={handleCloseModal}>
        Fechar
        </Button>
      </Box>
      </Box>
    </Modal>
  </div>
);
}