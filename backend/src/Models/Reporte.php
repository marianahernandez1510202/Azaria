<?php
namespace App\Models;
use App\Services\DatabaseService;

class Reporte {
    private static $table = 'reportes_contenido';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }

    public static function getPendientes() {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT r.*, u.nombre_completo as reportado_por_nombre
             FROM " . self::$table . " r
             LEFT JOIN usuarios u ON r.reportado_por = u.id
             WHERE r.estado = 'pendiente'
             ORDER BY r.created_at ASC"
        )->fetchAll();
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . " (reportado_por, tipo_contenido, contenido_id, razon, descripcion, estado, created_at)
             VALUES (?, ?, ?, ?, ?, 'pendiente', NOW())",
            [
                $data['usuario_id'],
                $data['contenido_tipo'],
                $data['contenido_id'],
                $data['motivo'],
                $data['descripcion'] ?? null
            ]
        );

        $id = $db->lastInsertId();
        return self::find($id);
    }

    public static function resolve($id, $estado, $notas = null) {
        $db = DatabaseService::getInstance();
        return $db->query(
            "UPDATE " . self::$table . " SET estado = ?, accion_tomada = ?, updated_at = NOW() WHERE id = ?",
            [$estado, $notas, $id]
        );
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
