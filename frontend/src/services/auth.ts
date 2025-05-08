import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

interface RegisterData {
  name: string;
  email: string;
  cpf: string;
  password: string;
  password_confirmation: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    cpf: string;
    balance: number;
  };
  token: string;
}

export const authService = {
  /**
   * Registra um novo usuário
   * @param data Dados do usuário para registro
   * @returns Resposta da API com dados do usuário e token
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/register', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errorMessage = error.response.data.message.replace(/\(.*?\)/, '');
        throw new Error(errorMessage);
      }
      throw new Error('Erro ao registrar usuário. Por favor, tente novamente.');
    }
  },

  /**
   * Realiza login do usuário
   * @param data Credenciais do usuário
   * @returns Resposta da API com dados do usuário e token
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/login', data);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        throw new Error(error.response.data.message || 'Credenciais inválidas');
      }
      throw error;
    }
  },

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    localStorage.removeItem('token');
  },

  /**
   * Obtém os dados do usuário atual
   * @returns Dados do usuário autenticado
   */
  async getCurrentUser(): Promise<AuthResponse['user']> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const response = await api.get<AuthResponse['user']>('/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }
      throw error;
    }
  }
}; 