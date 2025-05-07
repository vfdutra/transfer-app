import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUser, deleteUser } from '../../services/api';
import { Box, Button, TextField, Typography, Container, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: user?.cpf || '',
    password: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openDelete, setOpenDelete] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateUser(form);
      setSuccess('Dados atualizados com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar dados');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser();
      logout();
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir conta');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="xs" sx={{ boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', py: 4, position: 'relative' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ position: 'absolute', left: 16, top: 16 }}
        >
          Voltar
        </Button>
        <Typography component="h1" variant="h5" align="center" mb={2} sx={{ mt: 2 }}>
          Meu Perfil
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            margin="normal"
            fullWidth
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="CPF"
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Nova Senha"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
            Salvar Alterações
          </Button>
        </Box>
        <Button
          color="error"
          variant="outlined"
          fullWidth
          sx={{ mt: 3 }}
          onClick={() => setOpenDelete(true)}
        >
          Excluir Conta
        </Button>
        <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            Tem certeza que deseja excluir sua conta? Esta ação não poderá ser desfeita.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
            <Button color="error" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 