# Sistema de Transferência Bancária

Um sistema moderno de transferência bancária desenvolvido com Laravel e React, oferecendo uma experiência segura e intuitiva para gerenciamento de transações financeiras.

## 🚀 Funcionalidades

### Autenticação e Usuários
- Registro de usuários com validação de CPF único
- Login seguro com autenticação via token
- Gerenciamento de perfil do usuário
- Exclusão de conta

### Transações
- Transferência entre usuários
- Depósito em conta
- Histórico de transações
- Reversão de transações
- Sistema de saldo em conta

## 🛠️ Tecnologias Utilizadas

### Backend
- PHP 8.1+
- Laravel 10.x
- Laravel Sanctum (Autenticação)
- MySQL (Banco de dados)
- Docker (Containerização)

### Frontend
- React
- TypeScript
- Material-UI (MUI)
- Vite
- Axios

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd transfer-app-v4
```

2. Configure o ambiente backend:
```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
```

3. Configure o ambiente frontend:
```bash
cd frontend
npm install
```

4. Inicie os serviços com Docker:
```bash
docker-compose up -d
```

5. Execute as migrations:
```bash
php artisan migrate
```

## 🚀 Executando o Projeto

### Backend
```bash
php artisan serve
```

### Frontend
```bash
cd frontend
npm run dev
```

## 🔒 Segurança

- Autenticação via tokens
- Validação de dados
- Transações atômicas
- Proteção contra SQL Injection
- Sanitização de inputs
- Validação de CPF único
- Senhas criptografadas

## 📝 API Endpoints

### Autenticação
- POST /api/register - Registro de usuário
- POST /api/login - Login de usuário

### Usuários
- GET /api/user - Dados do usuário autenticado
- PUT /api/user - Atualização de dados
- DELETE /api/user - Exclusão de conta

### Transações
- POST /api/transactions/transfer - Realizar transferência
- POST /api/transactions/deposit - Realizar depósito
- GET /api/transactions/history - Histórico de transações
- POST /api/transactions/{transaction}/reverse - Reverter transação