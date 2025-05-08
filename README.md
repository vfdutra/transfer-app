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
- PHP 8.1+ (via Docker)
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

## 🔧 Instalação e Execução (via Docker)

1. **Clone o repositório:**
```bash
cd transfer-app-v4
```

2. **Copie o arquivo de variáveis de ambiente:**
```bash
cp .env.example .env
```

3. **Suba os containers:**
```bash
docker-compose up -d
```

4. **Acesse a aplicação:**
- Frontend: http://localhost:5173
- API: http://localhost:8000/api

## 📋 Pré-requisitos

- Docker
- Docker Compose
- Git

> **Obs:** Não é necessário instalar PHP, Composer ou Node.js localmente. Todo o ambiente é gerenciado via Docker.

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

## 🔒 Segurança

- Autenticação via tokens
- Validação de dados
- Transações atômicas
- Proteção contra SQL Injection
- Sanitização de inputs
- Validação de CPF único
- Senhas criptografadas