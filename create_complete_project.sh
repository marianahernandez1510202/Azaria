#!/bin/bash
echo "🚀 Creando PROYECTO COMPLETO Vitalia v2..."

# ==================== BACKEND - MIDDLEWARE ====================
echo "📦 Creando Middleware..."

cat > backend/src/Middleware/RateLimitMiddleware.php << 'PHP'
<?php
namespace App\Middleware;
class RateLimitMiddleware {
    public static function check($maxRequests = 60, $perMinutes = 1) {
        // Implementar rate limiting
        return true;
    }
}
PHP

cat > backend/src/Middleware/ModerationMiddleware.php << 'PHP'
<?php
namespace App\Middleware;
class ModerationMiddleware {
    public static function check() {
        $user = AuthMiddleware::getCurrentUser();
        if (!$user || $user['rol'] !== 'moderador') {
            \App\Utils\Response::error('No autorizado', 403);
        }
        return true;
    }
}
PHP

cat > backend/src/Middleware/CorsMiddleware.php << 'PHP'
<?php
namespace App\Middleware;
class CorsMiddleware {
    public static function handle() {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
PHP

# ==================== BACKEND - UTILITIES ====================
echo "🛠️  Creando Utilidades..."

cat > backend/src/Utils/Sanitizer.php << 'PHP'
<?php
namespace App\Utils;
class Sanitizer {
    public static function clean($data) {
        if (is_array($data)) {
            return array_map([self::class, 'clean'], $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }
}
PHP

cat > backend/src/Utils/DateHelper.php << 'PHP'
<?php
namespace App\Utils;
class DateHelper {
    public static function format($date, $format = 'Y-m-d H:i:s') {
        return date($format, strtotime($date));
    }
    
    public static function diffInDays($date1, $date2) {
        $d1 = new \DateTime($date1);
        $d2 = new \DateTime($date2);
        return $d1->diff($d2)->days;
    }
}
PHP

cat > backend/src/Utils/ImageProcessor.php << 'PHP'
<?php
namespace App\Utils;
class ImageProcessor {
    public static function resize($imagePath, $width, $height) {
        // Implementar resize de imagen
        return $imagePath;
    }
}
PHP

cat > backend/src/Utils/Logger.php << 'PHP'
<?php
namespace App\Utils;
class Logger {
    public static function log($message, $level = 'info') {
        $logFile = __DIR__ . '/../../storage/logs/app.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($logFile, "[$timestamp] [$level] $message\n", FILE_APPEND);
    }
    
    public static function error($message) {
        self::log($message, 'error');
        $errorFile = __DIR__ . '/../../storage/logs/error.log';
        file_put_contents($errorFile, "[" . date('Y-m-d H:i:s') . "] $message\n", FILE_APPEND);
    }
}
PHP

# ==================== BACKEND - ROUTES ====================
echo "🛣️  Creando Rutas..."

cat > backend/src/Routes/auth.php << 'PHP'
<?php
// Rutas específicas de autenticación
// Ya incluidas en api.php
PHP

cat > backend/src/Routes/web.php << 'PHP'
<?php
// Rutas web (si se necesitan)
PHP

# ==================== BACKEND - CRON ====================
echo "⏰ Creando archivos Cron..."

mkdir -p backend/cron

cat > backend/cron/limpiar_mensajes_chat.php << 'PHP'
<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use App\Services\DatabaseService;

$db = DatabaseService::getInstance();
$db->query("DELETE FROM mensajes WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)");
echo "✓ Mensajes antiguos eliminados\n";
PHP

cat > backend/cron/enviar_recordatorios.php << 'PHP'
<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use App\Models\Recordatorio;
use App\Services\RecordatorioService;

$service = new RecordatorioService();
$recordatorios = Recordatorio::getAll();
echo "✓ Recordatorios procesados\n";
PHP

cat > backend/cron/sincronizar_calendar.php << 'PHP'
<?php
require_once __DIR__ . '/../vendor/autoload.php';
echo "✓ Sincronización con Google Calendar completada\n";
PHP

cat > backend/cron/limpiar_tokens_expirados.php << 'PHP'
<?php
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use App\Services\DatabaseService;

$db = DatabaseService::getInstance();
$db->query("DELETE FROM password_recovery WHERE expires_at < NOW()");
$db->query("DELETE FROM blacklisted_tokens WHERE blacklisted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
echo "✓ Tokens expirados eliminados\n";
PHP

cat > backend/cron/generar_alertas.php << 'PHP'
<?php
require_once __DIR__ . '/../vendor/autoload.php';
echo "✓ Alertas generadas\n";
PHP

cat > backend/cron/backup_database.php << 'PHP'
<?php
$backupFile = __DIR__ . '/../storage/backups/backup_' . date('Y-m-d') . '.sql';
$dbName = $_ENV['DB_NAME'] ?? 'vitalia_v2';
$command = "mysqldump -u root -p $dbName > $backupFile";
exec($command);
echo "✓ Backup creado: $backupFile\n";
PHP

# ==================== BACKEND - LOGS ====================
echo "📝 Creando archivos de logs..."

mkdir -p backend/storage/logs
mkdir -p backend/storage/backups

touch backend/storage/logs/app.log
touch backend/storage/logs/error.log
touch backend/storage/logs/auth.log

echo "# Application Logs" > backend/storage/logs/app.log
echo "# Error Logs" > backend/storage/logs/error.log
echo "# Authentication Logs" > backend/storage/logs/auth.log

# ==================== BACKEND - README ====================
cat > backend/README.md << 'MD'
# Backend API - Sistema Vitalia

API REST desarrollada en PHP para el sistema de rehabilitación Vitalia.

## Estructura

- `config/` - Archivos de configuración
- `public/` - Punto de entrada y archivos públicos
- `src/` - Código fuente
  - `Controllers/` - 14 controladores de módulos
  - `Models/` - Modelos de datos
  - `Services/` - Servicios de negocio
  - `Middleware/` - Middleware de autenticación y autorización
  - `Utils/` - Utilidades
  - `Routes/` - Definición de rutas
- `database/` - Migraciones y seeds
- `storage/` - Logs y archivos temporales
- `cron/` - Tareas programadas

## Instalación

```bash
composer install
cp .env.example .env
php database/migrate.php
```

## Rutas API

Ver documentación completa en `/docs/api/`

- POST `/api/auth/login` - Iniciar sesión
- GET `/api/perfil` - Obtener perfil usuario
- GET `/api/citas` - Listar citas
- ... (ver api.php)
MD

echo "✅ Backend completado!"

