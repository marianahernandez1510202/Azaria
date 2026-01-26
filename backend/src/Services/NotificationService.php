<?php
namespace App\Services;

class NotificationService {
    public function sendNotification($data) {
        $db = DatabaseService::getInstance();
        $db->query("INSERT INTO notificaciones (user_id, tipo, titulo, mensaje, leido, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
            [$data['user_id'], $data['tipo'], $data['titulo'], $data['mensaje']]);
        return true;
    }
    
    public function markAsRead($notificationId) {
        $db = DatabaseService::getInstance();
        return $db->query("UPDATE notificaciones SET leido = 1 WHERE id = ?", [$notificationId]);
    }
}
