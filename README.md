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

## 📋 Pré-requisitos

### Sistema Operacional
- Ubuntu 20.04 LTS ou superior
- Windows 10/11 com WSL2 (Windows Subsystem for Linux)
- macOS 10.15 ou superior

### Dependências do Sistema
- PHP 8.1 ou superior
- Composer 2.0 ou superior
- Node.js 16.x ou superior
- Docker e Docker Compose
- Git

### Extensões PHP Necessárias
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    php8.1 \
    php8.1-cli \
    php8.1-common \
    php8.1-curl \
    php8.1-mbstring \
    php8.1-mysql \
    php8.1-xml \
    php8.1-zip \
    php8.1-bcmath \
    php8.1-gd \
    php8.1-intl \
    php8.1-pdo \
    php8.1-tokenizer \
    php8.1-xml \
    php8.1-fileinfo

# macOS (usando Homebrew)
brew install php@8.1
brew install composer

# Windows (usando WSL2)
sudo apt-get update
sudo apt-get install -y \
    php8.1 \
    php8.1-cli \
    php8.1-common \
    php8.1-curl \
    php8.1-mbstring \
    php8.1-mysql \
    php8.1-xml \
    php8.1-zip \
    php8.1-bcmath \
    php8.1-gd \
    php8.1-intl \
    php8.1-pdo \
    php8.1-tokenizer \
    php8.1-xml \
    php8.1-fileinfo
```

### Instalação do Composer
```bash
# Linux/macOS
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer

# Windows (usando WSL2)
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
sudo mv composer.phar /usr/local/bin/composer
```

### Verificação da Instalação
```bash
# Verificar versão do PHP
php -v

# Verificar versão do Composer
composer -V

# Verificar extensões PHP instaladas
php -m
```