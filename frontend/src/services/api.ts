import axios from 'axios';

/**
 * Instância do Axios configurada para a API.
 */
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

/**
 * Interceptor para adicionar o token em todas as requisições.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Função para formatar mensagens de erro de validação
 */
const formatValidationErrors = (errors: Record<string, string[]>): string => {
  const formattedErrors = Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field === 'cpf' ? 'CPF' : 
                       field === 'password_confirmation' ? 'Confirmação de senha' :
                       field.charAt(0).toUpperCase() + field.slice(1);
      return messages.map(message => `${fieldName}: ${message}`).join('\n');
    })
    .join('\n');
  
  return formattedErrors;
};

/**
 * Interceptor para tratar erros de resposta
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Sua sessão expirou. Por favor, faça login novamente.'));
    }

    const response = error.response?.data;

    // Erro de validação (422)
    if (error.response?.status === 422 && response?.errors) {
      const errorMessage = formatValidationErrors(response.errors);
      return Promise.reject(new Error(errorMessage));
    }

    // Erro com mensagem específica
    if (response?.message) {
      // Se tiver erro detalhado, inclui na mensagem
      if (response.error) {
        return Promise.reject(new Error(`${response.message}\n${response.error}`));
      }
      return Promise.reject(new Error(response.message));
    }

    // Erro genérico
    return Promise.reject(new Error('Ocorreu um erro inesperado. Por favor, tente novamente.'));
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

/**
 * Realiza login do usuário.
 * @param credentials - Objeto com email e senha.
 * @returns Dados do usuário e token de autenticação.
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', credentials);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

/**
 * Realiza transferência entre usuários.
 * @param data - receiver_id: ID do destinatário, amount: valor, description: descrição opcional.
 * @returns Mensagem, transação criada e novo saldo.
 */
export const transfer = async (data: { receiver_id: number; amount: number; description?: string }): Promise<TransactionResult> => {
  const response = await api.post('/transactions/transfer', data);
  return response.data;
};

/**
 * Realiza depósito na conta do usuário autenticado.
 * @param data - amount: valor, description: descrição opcional.
 * @returns Mensagem, transação criada e novo saldo.
 */
export const deposit = async (data: { amount: number; description?: string }): Promise<TransactionResult> => {
  const response = await api.post('/transactions/deposit', data);
  return response.data;
};

/**
 * Busca o histórico de transações do usuário autenticado.
 * @param page - Página da paginação (opcional, padrão 1).
 * @returns Lista paginada de transações.
 */
export const getTransactionHistory = async (page: number = 1): Promise<TransactionResponse> => {
  const response = await api.get(`/transactions/history?page=${page}`);
  return response.data;
};

/**
 * Reverte uma transação.
 * @param transactionId - ID da transação a ser revertida.
 * @returns Mensagem, transação revertida e novo saldo.
 */
export const reverseTransaction = async (transactionId: number): Promise<TransactionResult> => {
  const response = await api.post(`/transactions/${transactionId}/reverse`);
  return response.data;
};

/**
 * Envia uma contestação de reversão de transação.
 * @param transactionId - ID da transação revertida.
 * @param reason - Motivo da contestação.
 * @returns Mensagem, transação atualizada e novo saldo.
 */
export const disputeReversedTransaction = async (transactionId: number, reason: string): Promise<TransactionResult> => {
  const response = await api.post(`/transactions/${transactionId}/dispute`, { reason });
  return response.data;
};

/**
 * Busca dados de um usuário pelo ID.
 * @param id - ID do usuário.
 * @returns Dados resumidos do usuário (id, name, email, cpf).
 */
export const getUserById = async (id: number): Promise<UserSummary> => {
  const response = await api.get(`/users/${id}`);
  return response.data.user;
};

/**
 * Atualiza os dados do usuário autenticado.
 * @param data - Campos a serem atualizados (name, email, cpf, password).
 * @returns Usuário atualizado.
 */
export const updateUser = async (data: UpdateUserData): Promise<LoginResponse['user']> => {
  const response = await api.put('/user', data);
  return response.data.user;
};

/**
 * Exclui a conta do usuário autenticado.
 * @returns Mensagem de sucesso.
 */
export const deleteUser = async (): Promise<{ message: string }> => {
  const response = await api.delete('/user');
  return response.data;
};

export default api; 