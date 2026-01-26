<?php
namespace App\Services;

class ModerationService {
    public function moderate($content) {
        // Moderar contenido (palabras prohibidas, spam, etc)
        $badWords = ['spam', 'prohibido'];
        foreach ($badWords as $word) {
            if (stripos($content, $word) !== false) {
                return ['approved' => false, 'reason' => 'Contenido inapropiado'];
            }
        }
        return ['approved' => true];
    }
    
    public function notifyModerators($reporte) {
        // Notificar a moderadores
        return true;
    }
}
