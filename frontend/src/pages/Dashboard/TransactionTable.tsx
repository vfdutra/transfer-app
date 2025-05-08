import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Tooltip, IconButton } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import GavelIcon from '@mui/icons-material/Gavel';
import { formatCurrency } from '../../utils/format';

const TransactionTable = React.memo(({
  transactions,
  page,
  rowsPerPage,
  onPageChange,
  user,
  getStatusChip,
  handleReverse,
  setSelectedTransaction,
  setOpenDispute
}: any) => (
  <>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>De</TableCell>
            <TableCell>Para</TableCell>
            <TableCell>Valor</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions?.data.map((transaction: any) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </TableCell>
              <TableCell>
                {transaction.type === 'transfer' ? 'Transferência' : 'Depósito'}
              </TableCell>
              <TableCell>{transaction.sender.name}</TableCell>
              <TableCell>{transaction.receiver.name}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>
                {getStatusChip(transaction.status, transaction.dispute_status)}
              </TableCell>
              <TableCell>
                {transaction.status === 'completed' && transaction.type === 'transfer' && transaction.can_reverse && (
                  <Tooltip title="Reverter transação">
                    <IconButton color="error" onClick={() => handleReverse(transaction.id)}>
                      <UndoIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {transaction.status === 'reversed' && transaction.receiver_id === user?.id && !transaction.dispute_status && (
                  <Tooltip title="Contestar reversão">
                    <IconButton color="warning" onClick={() => {
                      setSelectedTransaction(transaction.id);
                      setOpenDispute(true);
                    }}>
                      <GavelIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      component="div"
      count={transactions?.total || 0}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[10]}
    />
  </>
));

export default TransactionTable; 