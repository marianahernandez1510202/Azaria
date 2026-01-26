<?php
namespace App\Models;
use App\Services\DatabaseService;

class FAQ {
    private static $table = 'faqs';
    
    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }
    
    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }
    
    public static function create($data) {
        $db = DatabaseService::getInstance();
        // Implementar INSERT según campos de la tabla
        return true;
    }
    
    public static function update($id, $data) {
        $db = DatabaseService::getInstance();
        // Implementar UPDATE
        return true;
    }
    
    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
