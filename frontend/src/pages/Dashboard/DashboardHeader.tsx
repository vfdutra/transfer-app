import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';
import type { UserSummary } from '../../services/api';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningIcon from '@mui/icons-material/Warning';

interface DashboardHeaderProps {
  user: UserSummary | null;
  logout: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, logout, navigate }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Transfer App</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Saldo:</span>
              <span className={`text-lg font-semibold ${(user?.balance ?? 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(user?.balance ?? 0)}
              </span>
              {(user?.balance ?? 0) < 0 && (
                <WarningIcon className="text-yellow-500" />
              )}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <AccountCircleIcon className="mr-2" />
              Perfil
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogoutIcon className="mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 