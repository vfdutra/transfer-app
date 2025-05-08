#!/bin/bash

# Criar diretórios necessários
mkdir -p /var/www/storage/logs \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/framework/cache \
    /var/www/bootstrap/cache

# Navegar para o diretório correto
cd /var/www

# Instalar dependências do Composer
composer install

chmod -R 777 /var/www/storage /var/www/bootstrap/cache /var/www/vendor

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

# Esperar o MySQL estar pronto
until php artisan migrate:status > /dev/null 2>&1; do
  echo "Aguardando o banco de dados ficar pronto..."
  sleep 3
done

# Executar migrações
php artisan migrate --force

# Iniciar o servidor
php-fpm 