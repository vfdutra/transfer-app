import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Box,
  Alert,
  AppBar,
  Toolbar,
  Tooltip,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getTransactionHistory, transfer, deposit, reverseTransaction, disputeReversedTransaction, getUserById } from '../../services/api';
import type { UserSummary } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import UndoIcon from '@mui/icons-material/Undo';
import GavelIcon from '@mui/icons-material/Gavel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningIcon from '@mui/icons-material/Warning';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  borderRadius: theme.spacing(2),
  width: '100%',
  maxWidth: 'none',
  minHeight: 400,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
  fontSize: 16,
}));

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

  const { data: transactions, isLoading } = useQuery({
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      updateUserBalance(data.new_balance);
      setOpenDispute(false);
      setDisputeReason('');
      setSelectedTransaction(null);
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Erro ao contestar reversão');
    },
  });

  const handleOpenTransfer = () => {
    setOpenTransfer(true);
    setStepTransfer('form');
    setReceiverInfo(null);
    setTransferData({ receiver_id: '', amount: '', description: '' });
  };

  const handleCheckReceiver = async () => {
    setError('');
    setLoadingReceiver(true);
    try {
      const user = await getUserById(Number(transferData.receiver_id));
      setReceiverInfo(user);
      setStepTransfer('confirm');
    } catch (err: any) {
      setError('Destinatário não encontrado. Verifique o ID.');
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const getStatusChip = (status: string, disputeStatus?: string) => {
    switch (status) {
      case 'completed':
        return <Chip label="Concluída" color="success" />;
      case 'pending':
        return <Chip label="Pendente" color="warning" />;
      case 'failed':
        return <Chip label="Falhou" color="error" />;
      case 'reversed':
        if (disputeStatus === 'pending') {
          return <Chip label="Revertida (Em Disputa)" color="warning" />;
        } else if (disputeStatus === 'approved') {
          return <Chip label="Disputa Aprovada" color="success" />;
        } else if (disputeStatus === 'rejected') {
          return <Chip label="Disputa Rejeitada" color="error" />;
        }
        return <Chip label="Revertida" color="default" />;
      case 'disputed':
        return <Chip label="Em Disputa" color="warning" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" sx={{ boxShadow: 3 }}>
        <Toolbar sx={{ maxWidth: 1400, width: '100%', mx: 'auto' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Olá, {user?.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <AccountBalanceWalletIcon sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Saldo: {formatCurrency(user?.balance ?? 0)}
            </Typography>
            {(user?.balance ?? 0) < 0 && (
              <Tooltip title="Seu saldo está negativo. O valor será descontado automaticamente no seu próximo depósito.">
                <WarningIcon color="warning" />
              </Tooltip>
            )}
          </Box>
          <IconButton color="inherit" onClick={() => navigate('/profile')} sx={{ mr: 1 }}>
            <AccountCircleIcon />
          </IconButton>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Espaço para o AppBar fixo */}
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4, px: { xs: 1, sm: 3 } }}>
        <StyledPaper sx={{ width: { xs: '100%', md: '90%' }, maxWidth: 1400 }}>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} mb={2} gap={2} width="100%">
            <Typography variant="h5">Dashboard</Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenTransfer}
                sx={{ mr: 1 }}
                startIcon={<UndoIcon />}
              >
                Transferir
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setOpenDeposit(true)}
                startIcon={<AccountBalanceWalletIcon />}
              >
                Depositar
              </Button>
            </Box>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          <TableContainer sx={{ width: '100%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>Data</StyledTableHeadCell>
                  <StyledTableHeadCell>Tipo</StyledTableHeadCell>
                  <StyledTableHeadCell>De</StyledTableHeadCell>
                  <StyledTableHeadCell>Para</StyledTableHeadCell>
                  <StyledTableHeadCell>Valor</StyledTableHeadCell>
                  <StyledTableHeadCell>Status</StyledTableHeadCell>
                  <StyledTableHeadCell>Ações</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions?.data.map((transaction) => (
                  <StyledTableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
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
                      {transaction.status === 'completed' &&
                        transaction.type === 'transfer' &&
                        transaction.can_reverse && (
                          <Tooltip title="Reverter transação">
                            <IconButton
                              color="error"
                              onClick={() => handleReverse(transaction.id)}
                              disabled={reverseMutation.isPending}
                            >
                              <UndoIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      {transaction.status === 'reversed' &&
                        transaction.receiver_id === user?.id &&
                        !transaction.dispute_status && (
                          <Tooltip title="Contestar reversão">
                            <IconButton
                              color="warning"
                              onClick={() => {
                                setSelectedTransaction(transaction.id);
                                setOpenDispute(true);
                              }}
                            >
                              <GavelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={transactions?.total || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10]}
          />
        </StyledPaper>
      </Box>
      {/* Modal de Transferência */}
      <Dialog open={openTransfer} onClose={() => setOpenTransfer(false)}>
        <DialogTitle>Realizar Transferência</DialogTitle>
        <DialogContent>
          {stepTransfer === 'form' && (
            <>
              {(user?.balance ?? 0) < 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Seu saldo está negativo. O valor será descontado automaticamente no seu próximo depósito.
                </Alert>
              )}
              <TextField
                autoFocus
                margin="dense"
                label="ID do Destinatário"
                type="number"
                fullWidth
                value={transferData.receiver_id}
                onChange={(e) => setTransferData({ ...transferData, receiver_id: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Valor"
                type="number"
                fullWidth
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Descrição"
                fullWidth
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
              />
            </>
          )}
          {stepTransfer === 'confirm' && receiverInfo && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Confirme os dados do destinatário:</Typography>
              <Typography><b>Nome:</b> {receiverInfo.name}</Typography>
              <Typography><b>Email:</b> {receiverInfo.email}</Typography>
              <Typography><b>CPF:</b> {receiverInfo.cpf}</Typography>
              <Typography sx={{ mt: 2 }}><b>Valor:</b> {formatCurrency(Number(transferData.amount))}</Typography>
              {transferData.description && (
                <Typography><b>Descrição:</b> {transferData.description}</Typography>
              )}
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          {stepTransfer === 'form' ? (
            <>
              <Button onClick={() => setOpenTransfer(false)}>Cancelar</Button>
              <Button
                onClick={handleCheckReceiver}
                disabled={loadingReceiver || !transferData.receiver_id || !transferData.amount}
                variant="contained"
                color="primary"
              >
                {loadingReceiver ? 'Verificando...' : 'Avançar'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setStepTransfer('form')}>Voltar</Button>
              <Button
                onClick={handleTransferConfirm}
                disabled={transferMutation.isPending}
                variant="contained"
                color="primary"
              >
                Confirmar e Transferir
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de Depósito */}
      <Dialog open={openDeposit} onClose={() => setOpenDeposit(false)}>
        <DialogTitle>Realizar Depósito</DialogTitle>
        <DialogContent>
          {(user?.balance ?? 0) < 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Seu saldo atual é {formatCurrency(user?.balance ?? 0)}. 
              O valor será descontado automaticamente deste depósito.
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Valor"
            type="number"
            fullWidth
            value={depositData.amount}
            onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            value={depositData.description}
            onChange={(e) => setDepositData({ ...depositData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeposit(false)}>Cancelar</Button>
          <Button
            onClick={handleDeposit}
            disabled={depositMutation.isPending}
            variant="contained"
            color="primary"
          >
            Depositar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Contestação */}
      <Dialog open={openDispute} onClose={() => setOpenDispute(false)}>
        <DialogTitle>Contestar Reversão</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Por favor, explique o motivo da sua contestação. Nossa equipe irá analisar seu caso.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo da Contestação"
            fullWidth
            multiline
            rows={4}
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDispute(false)}>Cancelar</Button>
          <Button
            onClick={handleDispute}
            disabled={disputeMutation.isPending || !disputeReason}
            variant="contained"
            color="primary"
          >
            Enviar Contestação
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard; 