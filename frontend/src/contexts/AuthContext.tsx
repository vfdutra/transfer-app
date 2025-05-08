import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

interface User {
  id: number;
  name: string;
  email: string;
  cpf: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ['/login', '/register'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(userData => {
          setUser(userData as User);
          if (publicRoutes.includes(location.pathname)) {
            navigate('/dashboard', { replace: true });
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          if (!publicRoutes.includes(location.pathname)) {
            navigate('/login', { replace: true });
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      if (!publicRoutes.includes(location.pathname)) {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user as User);
      navigate('/dashboard');
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 