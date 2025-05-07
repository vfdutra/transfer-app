import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    cpf: string;
    balance: number;
  };
  token: string;
}

export interface Transaction {
  id: number;
  sender_id: number;
  receiver_id: number;
  amount: number;
  type: 'transfer' | 'deposit';
  status: 'pending' | 'completed' | 'failed' | 'reversed' | 'disputed';
  description?: string;
  created_at: string;
  reversed_at?: string;
  dispute_reason?: string;
  dispute_status?: 'pending' | 'approved' | 'rejected';
  can_reverse: boolean;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  receiver: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TransactionResponse {
  data: Transaction[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface TransactionResult {
  message: string;
  transaction: Transaction;
  new_balance: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  cpf?: string;
  password?: string;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  cpf: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', credentials);
  // Salva o token no localStorage após o login
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const transfer = async (data: { receiver_id: number; amount: number; description?: string }): Promise<TransactionResult> => {
  const response = await api.post('/transactions/transfer', data);
  return response.data;
};

export const deposit = async (data: { amount: number; description?: string }): Promise<TransactionResult> => {
  const response = await api.post('/transactions/deposit', data);
  return response.data;
};

export const getTransactionHistory = async (page: number = 1): Promise<TransactionResponse> => {
  const response = await api.get(`/transactions/history?page=${page}`);
  return response.data;
};

export const reverseTransaction = async (transactionId: number): Promise<TransactionResult> => {
  const response = await api.post(`/transactions/${transactionId}/reverse`);
  return response.data;
};

export const disputeReversedTransaction = async (transactionId: number, reason: string): Promise<TransactionResult> => {
  const response = await api.post(`/transactions/${transactionId}/dispute`, { reason });
  return response.data;
};

export const updateUser = async (data: UpdateUserData): Promise<LoginResponse['user']> => {
  const response = await api.put('/user', data);
  return response.data.user;
};

export const deleteUser = async (): Promise<{ message: string }> => {
  const response = await api.delete('/user');
  return response.data;
};

export const getUserById = async (id: number): Promise<UserSummary> => {
  const response = await api.get(`/users/${id}`);
  return response.data.user;
};

export default api; 