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
cd transfer-app
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure as seguintes variáveis:
```env
# Configurações do Banco de Dados
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=secret
MYSQL_ROOT_PASSWORD=secret

# Configurações da Aplicação
APP_NAME="Transfer App"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Configurações do Frontend
VITE_API_URL=http://localhost:8000/api
```

3. **Suba os containers:**
```bash
docker-compose up -d --build
```

4. **Acesse a aplicação:**
- Frontend: http://localhost:8000
- API: http://localhost:8000/api

## 📋 Pré-requisitos

- Docker
- Docker Compose
- Git

> **Obs:** Não é necessário instalar PHP, Composer ou Node.js localmente. Todo o ambiente é gerenciado via Docker.

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente Importantes

O projeto utiliza as seguintes variáveis de ambiente principais:

#### Banco de Dados
- `DB_DATABASE`: Nome do banco de dados (padrão: laravel)
- `DB_USERNAME`: Usuário do banco de dados (padrão: laravel)
- `DB_PASSWORD`: Senha do usuário do banco de dados (padrão: secret)
- `MYSQL_ROOT_PASSWORD`: Senha do usuário root do MySQL (padrão: secret)

#### Aplicação
- `APP_NAME`: Nome da aplicação
- `APP_ENV`: Ambiente (development, production, etc)
- `APP_DEBUG`: Modo debug (true/false)
- `APP_URL`: URL base da aplicação

#### Frontend
- `VITE_API_URL`: URL da API para o frontend

### Solução de Problemas Comuns

1. **Erro de conexão com o banco de dados:**
   - Verifique se as variáveis de ambiente do banco de dados estão corretas
   - Certifique-se que o container do MySQL está rodando: `docker-compose ps`
   - Verifique os logs do MySQL: `docker-compose logs mysql`

2. **Erro de permissão:**
   - Execute: `docker-compose exec backend chmod -R 777 storage bootstrap/cache`

3. **Erro de build:**
   - Limpe os containers e volumes: `docker-compose down -v`
   - Reconstrua: `docker-compose up -d --build`

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