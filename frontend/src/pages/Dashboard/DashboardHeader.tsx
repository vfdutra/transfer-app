import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningIcon from '@mui/icons-material/Warning';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { formatCurrency } from '../../utils/format';

const DashboardHeader = React.memo(({ user, logout, navigate }: any) => (
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
));

export default DashboardHeader; 