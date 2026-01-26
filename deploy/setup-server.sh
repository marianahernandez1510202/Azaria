#!/bin/bash
# ===========================================
# Azaria - Server Setup Script
# Run this script on your Ubuntu server
# ===========================================

set -e

echo "=== Azaria Server Setup ==="

# Variables
APP_DIR="/var/www/azaria"
DB_NAME="azaria"
DB_USER="azaria"
DB_PASS="12345"

# Actualizar sistema
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
echo "Installing required packages..."
sudo apt install -y \
    apache2 \
    mysql-server \
    php8.1 \
    php8.1-mysql \
    php8.1-curl \
    php8.1-json \
    php8.1-mbstring \
    php8.1-xml \
    php8.1-zip \
    nodejs \
    npm \
    git \
    curl \
    unzip

# Habilitar módulos de Apache
echo "Configuring Apache..."
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl

# Crear estructura de directorios
echo "Creating directory structure..."
sudo mkdir -p $APP_DIR/frontend
sudo mkdir -p $APP_DIR/backend/storage/logs
sudo mkdir -p $APP_DIR/backend/public/uploads

# Configurar permisos
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod -R 777 $APP_DIR/backend/storage
sudo chmod -R 777 $APP_DIR/backend/public/uploads

# Crear base de datos
echo "Setting up MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Copiar configuración de Apache
echo "Configuring Apache virtual host..."
sudo cp /var/www/azaria/deploy/apache-azaria.conf /etc/apache2/sites-available/azaria.conf
sudo a2ensite azaria.conf
sudo a2dissite 000-default.conf

# Reiniciar Apache
echo "Restarting Apache..."
sudo systemctl restart apache2

# Instalar Node.js actualizado
echo "Installing Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo ""
echo "=== Setup Complete! ==="
echo "Next steps:"
echo "1. Clone your repository to $APP_DIR"
echo "2. Configure .env file in backend/"
echo "3. Import database schema"
echo "4. Build frontend with 'npm run build'"
echo ""
