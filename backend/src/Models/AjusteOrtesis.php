<?php
namespace App\Models;
use App\Services\DatabaseService;

class AjusteOrtesis {
    private static $table = 'ajustes_ortesis';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }

    public static function getByPaciente($pacienteId) {
        $db = DatabaseService::getInstance();

        return $db->query(
            "SELECT a.*, u.nombre_completo as realizado_por_nombre
             FROM " . self::$table . " a
             LEFT JOIN usuarios u ON a.realizado_por = u.id
             WHERE a.paciente_id = ?
             ORDER BY a.created_at DESC",
            [$pacienteId]
        )->fetchAll();
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . "
             (paciente_id, tipo_ajuste, descripcion, realizado_por, created_at)
             VALUES (?, ?, ?, ?, NOW())",
            [
                $data['paciente_id'],
                $data['tipo_ajuste'],
                $data['descripcion'],
                $data['realizado_por']
            ]
        );

        $id = $db->lastInsertId();
        return ['id' => $id];
    }

    public static function update($id, $data) {
        $db = DatabaseService::getInstance();

        $fields = [];
        $values = [];

        $allowedFields = ['tipo_ajuste', 'descripcion'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $values[] = $id;
        $query = "UPDATE " . self::$table . " SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";

        return $db->query($query, $values);
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
