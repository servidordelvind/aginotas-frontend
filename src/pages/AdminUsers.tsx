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

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@example.com',
      subscription: 'Plano Premium',
      paymentStatus: 'paid',
      active: true,
      registrationDate: '2023-01-15', // Exemplo
      usageTime: '1 ano e 3 meses', // Exemplo
    },
    {
      id: 2,
      name: 'Maria Oliveira',
      email: 'maria.oliveira@example.com',
      subscription: 'Plano Básico',
      paymentStatus: 'unpaid',
      active: true,
      registrationDate: '2023-05-20', // Exemplo
      usageTime: '9 meses', // Exemplo
    },
    {
      id: 3,
      name: 'Carlos Pereira',
      email: 'carlos.pereira@example.com',
      subscription: 'Plano Premium',
      paymentStatus: 'paid',
      active: false,
      registrationDate: '2023-08-10', // Exemplo
      usageTime: '6 meses', // Exemplo
    },
    {
      id: 4,
      name: 'Ana Souza',
      email: 'ana.souza@example.com',
      subscription: 'Plano Básico',
      paymentStatus: 'unpaid',
      active: true,
      registrationDate: '2023-11-05', // Exemplo
      usageTime: '3 meses', // Exemplo
    },
    {
      id: 5,
      name: 'Pedro Rodrigues',
      email: 'pedro.rodrigues@example.com',
      subscription: 'Plano Premium',
      paymentStatus: 'paid',
      active: true,
      registrationDate: '2024-02-28', // Exemplo
      usageTime: '1 mês', // Exemplo
    },
  ]);

  const [usersDB, setUsersDB] = useState<UserDB[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


  const handleToggleStatus = (userId: string) => {
    fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao atualizar status do usuário');
        }
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, active: !user.active } : user
          )
        );
      })
      .catch((err) => {
        setError(err.message);
      });
  };

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

  const handleOpenModal = (user: User) => {
    setSelectedUser(user);
    setOpenModal(true);
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

  console.log(usersDB);

  return (
    <div className="p-4 md:p-8">
    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-gray-800">Gerenciamento de Usuários</h1>

    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 md:p-4 text-left">Nome</th>
            <th className="p-2 md:p-4 text-left hidden sm:table-cell">Email</th>
            <th className="p-2 md:p-4 text-left hidden md:table-cell">Assinatura</th>
            <th className="p-2 md:p-4 text-left">Pagamento</th>
            <th className="p-2 md:p-4 text-left">Status</th>
            <th className="p-2 md:p-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usersDB.map((user) => (
            <tr key={user._id} className="border-b border-gray-200">
              <td className="p-2 md:p-4">{user.name}</td>
              <td className="p-2 md:p-4 hidden sm:table-cell">{user.email}</td>
              <td className="p-2 md:p-4 hidden md:table-cell">{user.subscription}</td>
              
              <td className="p-2 md:p-4">
                {user.paymentStatus === 'paid' ? (
                  <span className="flex items-center text-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Em dia
                  </span>
                ) : (
                  <span className="flex items-center text-red-500">
                    <XCircle className="w-4 h-4 mr-1" />
                    Atrasado
                  </span>
                )}
              </td>

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
                  <MenuItem onClick={() => { handleToggleStatus(user._id); handleMenuClose(); }}>
                    {user.status ? 'Desativar' : 'Ativar'}
                  </MenuItem>
                  <MenuItem onClick={() => { handleOpenModal(user); handleMenuClose(); }}>
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
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2">
          Detalhes do Usuário
        </Typography>
        {selectedUser && (
          <div>
            <p>ID: {selectedUser.id}</p>
            <p>Nome: {selectedUser.name}</p>
            <p>Email: {selectedUser.email}</p>
            <p>Assinatura: {selectedUser.subscription}</p>
            <p>Pagamento: {selectedUser.paymentStatus === 'paid' ? 'Em dia' : 'Atrasado'}</p>
            <p>Status: {selectedUser.active ? 'Ativo' : 'Inativo'}</p>
            <p>Data de Cadastro: {selectedUser.registrationDate}</p>
            <p>Tempo de Uso: {selectedUser.usageTime}</p>
          </div>
        )}
      </Box>
    </Modal>
  </div>
);
}