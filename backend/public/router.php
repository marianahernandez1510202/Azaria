<?php
/**
 * Router para el servidor de desarrollo PHP built-in.
 *
 * Uso: php -S localhost:8000 -t public public/router.php
 *
 * El servidor built-in de PHP no procesa .htaccess, entonces las URLs
 * con extensión de archivo (como /uploads/archivo.pdf) reciben 404
 * sin pasar por index.php. Este router resuelve eso.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Si el archivo existe fisicamente en public/, dejar que PHP lo sirva
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Todo lo demás va a index.php (rutas API + archivos de uploads)
require __DIR__ . '/index.php';
