import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getTransactionHistory, transfer, deposit, reverseTransaction, disputeReversedTransaction, getUserById } from '../../services/api';
import type { UserSummary } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import UndoIcon from '@mui/icons-material/Undo';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DashboardHeader from './DashboardHeader';
import TransactionTable from './TransactionTable';

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [openDeposit, setOpenDeposit] = useState(false);
  const [transferData, setTransferData] = useState({ receiver_id: '', amount: '', description: '' });
  const [depositData, setDepositData] = useState({ amount: '', description: '' });
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const [openDispute, setOpenDispute] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [stepTransfer, setStepTransfer] = useState<'form' | 'confirm'>('form');
  const [receiverInfo, setReceiverInfo] = useState<UserSummary | null>(null);
  const [loadingReceiver, setLoadingReceiver] = useState(false);

  const { data: transactions } = useQuery({
    queryKey: ['transactions', page + 1],
    queryFn: () => getTransactionHistory(page + 1),
  });

  const updateUserBalance = (newBalance: number) => {
    queryClient.setQueryData(['user'], (oldData: any) => ({
      ...oldData,
      user: {
        ...oldData.user,
        balance: newBalance,
      },
    }));
  };

  const transferMutation = useMutation({
    mutationFn: transfer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      updateUserBalance(data.new_balance);
      setOpenTransfer(false);
      setTransferData({ receiver_id: '', amount: '', description: '' });
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao realizar transferência');
    },
  });

  const depositMutation = useMutation({
    mutationFn: deposit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      updateUserBalance(data.new_balance);
      setOpenDeposit(false);
      setDepositData({ amount: '', description: '' });
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao realizar depósito');
    },
  });

  const reverseMutation = useMutation({
    mutationFn: reverseTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      updateUserBalance(data.new_balance);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao reverter transação');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: number; reason: string }) =>
      disputeReversedTransaction(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpenDispute(false);
      setDisputeReason('');
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao enviar contestação');
    },
  });

  const handleOpenTransfer = () => {
    setOpenTransfer(true);
    setStepTransfer('form');
    setReceiverInfo(null);
    setError('');
  };

  const handleCheckReceiver = async () => {
    if (!transferData.receiver_id) return;

    setLoadingReceiver(true);
    setError('');

    try {
      const receiver = await getUserById(Number(transferData.receiver_id));
      setReceiverInfo(receiver);
      setStepTransfer('confirm');
    } catch (error: any) {
      setError(error.message || 'Erro ao verificar destinatário');
    } finally {
      setLoadingReceiver(false);
    }
  };

  const handleTransferConfirm = () => {
    setStepTransfer('form');
    setReceiverInfo(null);
    transferMutation.mutate({
      receiver_id: Number(transferData.receiver_id),
      amount: Number(transferData.amount),
      description: transferData.description,
    });
  };

  const handleDeposit = () => {
    depositMutation.mutate({
      amount: Number(depositData.amount),
      description: depositData.description,
    });
  };

  const handleReverse = (transactionId: number) => {
    reverseMutation.mutate(transactionId);
  };

  const handleDispute = () => {
    if (selectedTransaction && disputeReason) {
      disputeMutation.mutate({
        transactionId: selectedTransaction,
        reason: disputeReason,
      });
    }
  };

  const handleChangePage = React.useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const getStatusChip = (status: string, disputeStatus?: string) => {
    const getChipClasses = (color: string) => 
      `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`;

    switch (status) {
      case 'completed':
        return <span className={getChipClasses('bg-green-100 text-green-800')}>Concluída</span>;
      case 'pending':
        return <span className={getChipClasses('bg-yellow-100 text-yellow-800')}>Pendente</span>;
      case 'failed':
        return <span className={getChipClasses('bg-red-100 text-red-800')}>Falhou</span>;
      case 'reversed':
        if (disputeStatus === 'pending') {
          return <span className={getChipClasses('bg-yellow-100 text-yellow-800')}>Revertida (Em Disputa)</span>;
        } else if (disputeStatus === 'approved') {
          return <span className={getChipClasses('bg-green-100 text-green-800')}>Disputa Aprovada</span>;
        } else if (disputeStatus === 'rejected') {
          return <span className={getChipClasses('bg-red-100 text-red-800')}>Disputa Rejeitada</span>;
        }
        return <span className={getChipClasses('bg-gray-100 text-gray-800')}>Revertida</span>;
      case 'disputed':
        return <span className={getChipClasses('bg-yellow-100 text-yellow-800')}>Em Disputa</span>;
      default:
        return <span className={getChipClasses('bg-gray-100 text-gray-800')}>{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} logout={logout} navigate={navigate} />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenTransfer}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UndoIcon className="mr-2" />
                  Transferir
                </button>
                <button
                  onClick={() => setOpenDeposit(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <AccountBalanceWalletIcon className="mr-2" />
                  Depositar
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700">
                {error}
              </div>
            )}

            <TransactionTable
              transactions={transactions}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              user={user}
              getStatusChip={getStatusChip}
              handleReverse={handleReverse}
              setSelectedTransaction={setSelectedTransaction}
              setOpenDispute={setOpenDispute}
            />
          </div>
        </div>
      </div>

      {/* Modal de Transferência */}
      {openTransfer && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Realizar Transferência</h3>
            
            {stepTransfer === 'form' && (
              <>
                {(user?.balance ?? 0) < 0 && (
                  <div className="mb-4 p-4 rounded-md bg-yellow-50 text-yellow-700">
                    Seu saldo está negativo. O valor será descontado automaticamente no seu próximo depósito.
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID do Destinatário</label>
                    <input
                      type="number"
                      value={transferData.receiver_id}
                      onChange={(e) => setTransferData({ ...transferData, receiver_id: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valor</label>
                    <input
                      type="number"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <input
                      type="text"
                      value={transferData.description}
                      onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {stepTransfer === 'confirm' && receiverInfo && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Confirme os dados do destinatário:</h4>
                <div className="space-y-2">
                  <p><span className="font-medium">Nome:</span> {receiverInfo.name}</p>
                  <p><span className="font-medium">Email:</span> {receiverInfo.email}</p>
                  <p><span className="font-medium">CPF:</span> {receiverInfo.cpf}</p>
                  <p><span className="font-medium">Valor:</span> {formatCurrency(Number(transferData.amount))}</p>
                  {transferData.description && (
                    <p><span className="font-medium">Descrição:</span> {transferData.description}</p>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-md bg-red-50 text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              {stepTransfer === 'form' ? (
                <>
                  <button
                    onClick={() => setOpenTransfer(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCheckReceiver}
                    disabled={loadingReceiver || !transferData.receiver_id || !transferData.amount}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingReceiver ? 'Verificando...' : 'Avançar'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setStepTransfer('form')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleTransferConfirm}
                    disabled={transferMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar e Transferir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Depósito */}
      {openDeposit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Realizar Depósito</h3>
            
            {(user?.balance ?? 0) < 0 && (
              <div className="mb-4 p-4 rounded-md bg-blue-50 text-blue-700">
                Seu saldo atual é {formatCurrency(user?.balance ?? 0)}. 
                O valor será descontado automaticamente deste depósito.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor</label>
                <input
                  type="number"
                  value={depositData.amount}
                  onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <input
                  type="text"
                  value={depositData.description}
                  onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setOpenDeposit(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeposit}
                disabled={depositMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Depositar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contestação */}
      {openDispute && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contestar Reversão</h3>
            
            <p className="text-sm text-gray-500 mb-4">
              Por favor, explique o motivo da sua contestação. Nossa equipe irá analisar seu caso.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700">Motivo da Contestação</label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setOpenDispute(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDispute}
                disabled={disputeMutation.isPending || !disputeReason}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar Contestação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 