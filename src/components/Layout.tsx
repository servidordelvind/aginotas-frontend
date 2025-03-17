import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, History, LogOut } from 'lucide-react';
import Cookies from "js-cookie";

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Clientes', path: '/customers' },
  { icon: Receipt, label: 'Assinaturas', path: '/subscriptions' },
  //{ icon: History, label: 'Histórico', path: '/history' },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

   const handleLogout = async () => {
    navigate('/');
    Cookies.remove('token');
  }; 

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-8">
          <Receipt className="w-8 h-8 text-blue-600" />
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
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
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

      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}