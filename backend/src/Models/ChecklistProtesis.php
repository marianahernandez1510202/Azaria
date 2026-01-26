<?php
namespace App\Models;
use App\Services\DatabaseService;

class ChecklistProtesis {
    private static $table = 'checklist_protesis';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " WHERE id = ?", [$id])->fetch();
    }

    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }

    public static function getByPaciente($pacienteId, $fecha = null) {
        $db = DatabaseService::getInstance();

        if ($fecha) {
            $checklist = $db->query(
                "SELECT * FROM " . self::$table . " WHERE paciente_id = ? AND fecha = ?",
                [$pacienteId, $fecha]
            )->fetch();

            if ($checklist) {
                return $checklist;
            }
        }

        // Devolver checklist por defecto
        return [
            'items' => [
                ['id' => 1, 'nombre' => 'Revisar estado del socket', 'completado' => false],
                ['id' => 2, 'nombre' => 'Limpiar la prótesis', 'completado' => false],
                ['id' => 3, 'nombre' => 'Verificar ajuste', 'completado' => false],
                ['id' => 4, 'nombre' => 'Revisar piel del muñón', 'completado' => false],
                ['id' => 5, 'nombre' => 'Ejercicios de fortalecimiento', 'completado' => false]
            ]
        ];
    }

    public static function save($data) {
        $db = DatabaseService::getInstance();

        $pacienteId = $data['paciente_id'];
        $fecha = $data['fecha'] ?? date('Y-m-d');
        $items = is_string($data['items']) ? $data['items'] : json_encode($data['items']);

        // Verificar si existe
        $existing = $db->query(
            "SELECT id FROM " . self::$table . " WHERE paciente_id = ? AND fecha = ?",
            [$pacienteId, $fecha]
        )->fetch();

        if ($existing) {
            $db->query(
                "UPDATE " . self::$table . " SET items = ?, foto = ?, updated_at = NOW() WHERE id = ?",
                [$items, $data['foto'] ?? null, $existing['id']]
            );
            return $existing['id'];
        } else {
            $db->query(
                "INSERT INTO " . self::$table . " (paciente_id, fecha, items, foto, created_at)
                 VALUES (?, ?, ?, ?, NOW())",
                [$pacienteId, $fecha, $items, $data['foto'] ?? null]
            );
            return $db->lastInsertId();
        }
    }

    public static function getHistorial($pacienteId, $filters = []) {
        $db = DatabaseService::getInstance();

        $query = "SELECT * FROM " . self::$table . " WHERE paciente_id = ?";
        $params = [$pacienteId];

        if (!empty($filters['desde'])) {
            $query .= " AND fecha >= ?";
            $params[] = $filters['desde'];
        }

        if (!empty($filters['hasta'])) {
            $query .= " AND fecha <= ?";
            $params[] = $filters['hasta'];
        }

        $query .= " ORDER BY fecha DESC LIMIT 30";

        $historial = $db->query($query, $params)->fetchAll();

        // Calcular progreso para cada entrada
        return array_map(function($h) {
            $items = json_decode($h['items'] ?? '[]', true);
            $total = count($items);
            $completados = count(array_filter($items, fn($i) => $i['completado'] ?? false));

            return [
                'id' => $h['id'],
                'fecha' => $h['fecha'],
                'progreso' => $total > 0 ? round(($completados / $total) * 100) : 0,
                'completados' => $completados,
                'total' => $total
            ];
        }, $historial);
    }

    public static function create($data) {
        return self::save($data);
    }

    public static function update($id, $data) {
        $db = DatabaseService::getInstance();
        $db->query(
            "UPDATE " . self::$table . " SET items = ?, updated_at = NOW() WHERE id = ?",
            [json_encode($data['items']), $id]
        );
        return true;
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
