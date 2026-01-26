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
