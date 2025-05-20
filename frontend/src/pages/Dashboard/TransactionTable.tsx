import React from 'react';
import { formatCurrency } from '../../utils/format';
import type { UserSummary } from '../../services/api';
import type { Transaction } from '../../services/api';
import UndoIcon from '@mui/icons-material/Undo';
import GavelIcon from '@mui/icons-material/Gavel';

interface TransactionTableProps {
  transactions: {
    data: Transaction[];
    total: number;
    current_page: number;
    last_page: number;
  } | undefined;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  user: UserSummary | null;
  getStatusChip: (status: string, disputeStatus?: string) => React.ReactNode;
  handleReverse: (transactionId: number) => void;
  setSelectedTransaction: (transactionId: number | null) => void;
  setOpenDispute: (open: boolean) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  page,
  rowsPerPage,
  onPageChange,
  getStatusChip,
  handleReverse,
  setSelectedTransaction,
  setOpenDispute,
}) => {
  if (!transactions) return null;

  const handleDispute = (transactionId: number) => {
    setSelectedTransaction(transactionId);
    setOpenDispute(true);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.data.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaction.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.type === 'transfer' ? 'Transferência' : 'Depósito'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusChip(transaction.status, transaction.dispute_status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.status === 'completed' && transaction.type === 'transfer' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReverse(transaction.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Reverter Transação"
                    >
                      <UndoIcon />
                    </button>
                  </div>
                )}
                {transaction.status === 'reversed' && !transaction.dispute_status && (
                  <button
                    onClick={() => handleDispute(transaction.id)}
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Contestar Reversão"
                  >
                    <GavelIcon />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= transactions.last_page - 1}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{page * rowsPerPage + 1}</span> até{' '}
              <span className="font-medium">
                {Math.min((page + 1) * rowsPerPage, transactions.total)}
              </span>{' '}
              de <span className="font-medium">{transactions.total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                &laquo;
              </button>
              {Array.from({ length: transactions.last_page }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber - 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === pageNumber - 1
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= transactions.last_page - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Próxima</span>
                &raquo;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable; 