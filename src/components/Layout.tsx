import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  ShieldCheck,
  UserCog,
  MessageSquare,
  MessageCircleCode,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import Cookies from 'js-cookie';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const adminToken = Cookies.get('admin_token');
    if (adminToken) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    navigate('/');
    Cookies.remove('token');
    Cookies.remove('admin_token');
    localStorage.clear();
  };

  const navItems = [
    ...(isAdmin
      ? [
        { icon: ShieldCheck, label: 'Admin Dashboard', path: '/admin/dashboard' },
        { icon: UserCog, label: 'Admin Users', path: '/admin/users' },
        { icon: MessageCircleCode, label: 'Admin Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Admin Subscriptions', path: '/admin/subscriptions' },
      ]
      : [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Clientes', path: '/customers' },
        { icon: MessageSquare, label: 'Chat com Suporte', path: '/chat' },
        { icon: Settings, label: 'Configurações', path: '/UserConfig' },
        { icon: CreditCard, label: 'Assinaturas', path: '/subscriptions' },
      ]),
  ];

  const shouldShowDropdown = windowSize.width < 1200 && windowSize.height < 750;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navegação Fixa */}
      <nav
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto ${shouldShowDropdown ? (isDropdownOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
          }`}
      >
        {shouldShowDropdown && (
          <button
            className="absolute top-4 right-4 text-gray-600"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {isDropdownOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
        <div className="flex items-center gap-2 mb-8">
          <CreditCard className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold">AgiNotas</h1>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                onClick={() => shouldShowDropdown && setIsDropdownOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <button
          className="absolute bottom-4 left-4 right-4 flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </nav>

      {/* Button to toggle dropdown menu on mobile */}
      {shouldShowDropdown && (
        <button
          className="fixed top-4 left-4 text-gray-600 z-50"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {!isDropdownOpen && <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Conteúdo Principal - Fixo com espaço para a navegação */}
      <main
        className={`p-8 flex-1 min-w-0 overflow-auto ${shouldShowDropdown ? 'ml-0' : 'ml-64'} transition-all duration-300`}
      >
        <Outlet />
      </main>
    </div>
  );
}
