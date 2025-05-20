#!/bin/bash

set -e

echo "Iniciando configuração do ambiente..."

# Criar diretórios necessários
echo "Criando diretórios necessários..."
mkdir -p /var/www/storage/logs \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/framework/cache \
    /var/www/bootstrap/cache

# Navegar para o diretório correto
cd /var/www

# Instalar dependências do Composer
echo "Instalando dependências do Composer..."
composer install --no-interaction --no-scripts

# Verificar se a instalação foi bem sucedida
if [ ! -d "vendor" ]; then
    echo "Erro: Falha na instalação das dependências do Composer"
    exit 1
fi

# Ajustar permissões após instalação
echo "Ajustando permissões após instalação..."
chmod -R 777 /var/www/storage /var/www/bootstrap/cache /var/www/vendor

# Copiar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "Criando arquivo .env..."
    cp .env.example .env
fi

# Gerar chave da aplicação
echo "Gerando chave da aplicação..."
php artisan key:generate

# Limpar cache
echo "Limpando cache..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Esperar o MySQL estar pronto
echo "Aguardando banco de dados..."
until php artisan migrate:status > /dev/null 2>&1; do
  echo "Aguardando o banco de dados ficar pronto..."
  sleep 3
done

# Executar migrações
echo "Executando migrações..."
php artisan migrate --force

echo "Configuração concluída! Iniciando servidor..."

# Iniciar o servidor
php-fpm 