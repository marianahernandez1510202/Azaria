<?php
namespace App\Models;
use App\Services\DatabaseService;

class ComentarioArticulo {
    private static $table = 'comentarios_articulos';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT c.*, u.nombre_completo as autor_nombre
             FROM " . self::$table . " c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.id = ?",
            [$id]
        )->fetch();
    }

    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT c.*, u.nombre_completo as autor_nombre
             FROM " . self::$table . " c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             ORDER BY c.created_at DESC"
        )->fetchAll();
    }

    public static function getByArticulo($articuloId) {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT c.*, u.nombre_completo as autor_nombre, u.avatar
             FROM " . self::$table . " c
             LEFT JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.articulo_id = ?
             ORDER BY c.created_at DESC",
            [$articuloId]
        )->fetchAll();
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . " (articulo_id, usuario_id, contenido, created_at)
             VALUES (?, ?, ?, NOW())",
            [
                $data['articulo_id'],
                $data['usuario_id'],
                $data['contenido']
            ]
        );

        $id = $db->lastInsertId();
        return self::find($id);
    }

    public static function update($id, $data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "UPDATE " . self::$table . " SET contenido = ?, updated_at = NOW() WHERE id = ?",
            [$data['contenido'], $id]
        );

        return true;
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }

    public static function countByArticulo($articuloId) {
        $db = DatabaseService::getInstance();

        $result = $db->query(
            "SELECT COUNT(*) as total FROM " . self::$table . " WHERE articulo_id = ?",
            [$articuloId]
        )->fetch();

        return $result['total'] ?? 0;
    }
}
