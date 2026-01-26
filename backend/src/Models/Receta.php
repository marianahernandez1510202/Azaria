<?php
namespace App\Models;
use App\Services\DatabaseService;

class Receta {
    private static $table = 'recetas';
    
    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }
    
    public static function getAll($fase = null) {
        $db = DatabaseService::getInstance();
        if ($fase) {
            return $db->query("SELECT * FROM " . self::$table . " WHERE fase = ? OR fase IS NULL ORDER BY created_at DESC", [$fase])->fetchAll();
        }
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }
    
    public static function create($data) {
        $db = DatabaseService::getInstance();
        $db->query("INSERT INTO " . self::$table . " (nombre, descripcion, ingredientes, preparacion, calorias, proteinas, carbohidratos, grasas, fase, imagen, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
            [$data['nombre'], $data['descripcion'], json_encode($data['ingredientes']), $data['preparacion'], $data['calorias'] ?? null, $data['proteinas'] ?? null, $data['carbohidratos'] ?? null, $data['grasas'] ?? null, $data['fase'] ?? null, $data['imagen'] ?? null]);
        return self::find($db->lastInsertId());
    }
    
    public static function update($id, $data) {
        $db = DatabaseService::getInstance();
        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                if ($key === 'ingredientes') {
                    $fields[] = "$key = ?";
                    $values[] = json_encode($value);
                } else {
                    $fields[] = "$key = ?";
                    $values[] = $value;
                }
            }
        }
        $values[] = $id;
        return $db->query("UPDATE " . self::$table . " SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?", $values);
    }
    
    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
