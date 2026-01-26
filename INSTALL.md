# Guía de Instalación - Sistema Vitalia v2

## Requisitos del Sistema

### Backend
- PHP >= 8.1
- MySQL >= 8.0
- Composer
- Apache/Nginx con mod_rewrite

### Frontend
- Node.js >= 18.0
- npm >= 9.0

## Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd vitalia
```

### 2. Configurar Backend

```bash
# Ir al directorio backend
cd backend

# Instalar dependencias PHP
composer install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales de base de datos
nano .env
```

#### Configurar Base de Datos

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE vitalia_v2;
exit;

# Ejecutar migraciones
php database/migrate.php

# Opcional: Cargar datos de prueba
php database/seed.php
```

#### Generar Claves de Seguridad

```bash
# Generar JWT_SECRET
php -r "echo bin2hex(random_bytes(32));"
# Copiar el resultado en JWT_SECRET en .env

# Generar ENCRYPTION_KEY
php -r "echo bin2hex(random_bytes(32));"
# Copiar el resultado en ENCRYPTION_KEY en .env
```

### 3. Configurar Frontend

```bash
# Ir al directorio frontend
cd ../frontend

# Instalar dependencias npm
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env si es necesario
nano .env
```

### 4. Configurar Google Calendar API (Opcional)

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto
3. Habilitar Google Calendar API
4. Crear credenciales OAuth 2.0
5. Copiar Client ID y Client Secret en backend/.env

### 5. Configurar Email (SendGrid o SMTP)

#### Opción A: SendGrid
```env
MAIL_DRIVER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=<tu-api-key-de-sendgrid>
```

#### Opción B: Gmail SMTP
```env
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=<contraseña-de-aplicación>
```

### 6. Configurar Tareas Programadas (Cron)

```bash
# Editar crontab
crontab -e

# Agregar las siguientes líneas:

# Limpiar mensajes antiguos cada hora
0 * * * * cd /ruta/a/vitalia/backend/cron && php limpiar_mensajes_chat.php

# Enviar recordatorios cada 15 minutos
*/15 * * * * cd /ruta/a/vitalia/backend/cron && php enviar_recordatorios.php

# Sincronizar con Google Calendar cada 30 minutos
*/30 * * * * cd /ruta/a/vitalia/backend/cron && php sincronizar_calendar.php

# Limpiar tokens expirados diariamente a las 2 AM
0 2 * * * cd /ruta/a/vitalia/backend/cron && php limpiar_tokens_expirados.php

# Generar alertas cada hora
0 * * * * cd /ruta/a/vitalia/backend/cron && php generar_alertas.php

# Backup de base de datos diariamente a las 3 AM
0 3 * * * cd /ruta/a/vitalia/backend/cron && php backup_database.php
```

### 7. Configurar Apache Virtual Host

```apache
<VirtualHost *:80>
    ServerName vitalia.local
    DocumentRoot /ruta/a/vitalia/backend/public

    <Directory /ruta/a/vitalia/backend/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/vitalia_error.log
    CustomLog ${APACHE_LOG_DIR}/vitalia_access.log combined
</VirtualHost>
```

### 8. Iniciar el Sistema

#### Opción A: Desarrollo con servidores integrados

```bash
# Terminal 1: Backend
cd backend/public
php -S localhost:8000

# Terminal 2: Frontend
cd frontend
npm start
```

#### Opción B: Usar npm script desde raíz

```bash
# Desde el directorio raíz
npm install
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

### 9. Crear Usuario Administrador

```bash
cd backend
php -r "
require 'vendor/autoload.php';
\$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
\$dotenv->load();

use App\Models\User;
use App\Services\DatabaseService;

\$db = DatabaseService::getInstance();
\$user = User::create([
    'email' => 'admin@vitalia.app',
    'password' => 'Admin2024!',
    'nombre_completo' => 'Administrador',
    'rol' => 'admin'
]);

echo 'Usuario administrador creado exitosamente\n';
echo 'Email: admin@vitalia.app\n';
echo 'Password: Admin2024!\n';
"
```

### 10. Verificar Instalación

1. Acceder a http://localhost:3000
2. Iniciar sesión con las credenciales de administrador
3. Verificar que todos los módulos carguen correctamente

## Solución de Problemas

### Error: "No se puede conectar a la base de datos"
- Verificar credenciales en backend/.env
- Verificar que MySQL esté corriendo: `sudo service mysql status`

### Error: "Token JWT inválido"
- Verificar que JWT_SECRET esté configurado en backend/.env
- Verificar que el token esté siendo enviado correctamente desde el frontend

### Error: "Cannot find module"
- Ejecutar `npm install` en el directorio frontend
- Ejecutar `composer install` en el directorio backend

### Los emails no se envían
- Verificar configuración SMTP en backend/.env
- Revisar logs en backend/storage/logs/error.log

## Mantenimiento

### Actualizar Dependencias

```bash
# Backend
cd backend
composer update

# Frontend
cd frontend
npm update
```

### Backup de Base de Datos

```bash
mysqldump -u root -p vitalia_v2 > backup_$(date +%Y%m%d).sql
```

### Ver Logs

```bash
# Logs del backend
tail -f backend/storage/logs/app.log
tail -f backend/storage/logs/error.log

# Logs de Apache
tail -f /var/log/apache2/vitalia_error.log
```

## Soporte

Para problemas o preguntas:
- Email: soporte-tecnico@vitalia.app
- Documentación: /docs
- Issues: GitHub Issues

## Seguridad

- Cambiar todas las contraseñas por defecto
- Configurar HTTPS en producción
- Mantener dependencias actualizadas
- Revisar logs regularmente
- Hacer backups frecuentes
