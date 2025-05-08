#!/bin/bash

# Criar diretórios necessários
mkdir -p /var/www/storage/logs \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/framework/cache \
    /var/www/bootstrap/cache

# Instalar dependências do Composer
composer install

# Copiar arquivo .env se não existir
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Gerar chave da aplicação
php artisan key:generate

# Limpar cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Executar migrações
php artisan migrate --force

# Iniciar o servidor
php-fpm 