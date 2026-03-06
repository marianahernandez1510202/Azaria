#!/bin/bash
# Script de deploy para Azaria
# Ejecutar este script en Git Bash

SERVER="dtai.uteq.edu.mx"
USER="azaria"
REMOTE_DIR="/home/azaria/public_html"

echo "=== Desplegando Azaria al servidor ==="
echo "Servidor: $SERVER"
echo "Usuario: $USER"
echo ""

# Subir frontend build
echo "1. Subiendo frontend build..."
scp -r frontend/build/* ${USER}@${SERVER}:${REMOTE_DIR}/

# Subir backend
echo "2. Subiendo backend..."
scp -r backend/src backend/public backend/composer.json ${USER}@${SERVER}:${REMOTE_DIR}/backend/

# Subir base de datos
echo "3. Subiendo archivos de base de datos..."
scp database/*.sql ${USER}@${SERVER}:~/

echo ""
echo "=== Archivos subidos ==="
echo ""
echo "4. Conectando al servidor para importar base de datos..."
echo "   Ejecuta estos comandos en el servidor:"
echo ""
echo "   mysql -u azaria -p12345 azaria < ~/Dump20260129.sql"
echo ""

# Conectar al servidor
ssh ${USER}@${SERVER}

echo "=== Deploy completado ==="
