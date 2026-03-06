<?php

namespace App\Models;

use App\Services\DatabaseService;

class EvaluacionFisica
{
    private static $table = 'evaluaciones_fisicas';

    public static function find($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT ef.*,
                    up.nombre_completo as paciente_nombre,
                    u.nombre_completo as especialista_nombre
             FROM " . self::$table . " ef
             LEFT JOIN pacientes p ON ef.paciente_id = p.id
             LEFT JOIN usuarios up ON p.usuario_id = up.id
             LEFT JOIN usuarios u ON ef.especialista_id = u.id
             WHERE ef.id = ?",
            [$id]
        )->fetch();
    }

    public static function getByPaciente($pacienteId, $limit = 20)
    {
        $db = DatabaseService::getInstance();
        $limit = (int)$limit;
        return $db->query(
            "SELECT ef.*,
                    u.nombre_completo as especialista_nombre
             FROM " . self::$table . " ef
             LEFT JOIN usuarios u ON ef.especialista_id = u.id
             WHERE ef.paciente_id = ?
             ORDER BY ef.fecha DESC
             LIMIT $limit",
            [$pacienteId]
        )->fetchAll();
    }

    public static function getUltima($pacienteId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT * FROM " . self::$table . "
             WHERE paciente_id = ?
             ORDER BY fecha DESC LIMIT 1",
            [$pacienteId]
        )->fetch();
    }

    public static function create($data)
    {
        $db = DatabaseService::getInstance();

        $fields = [
            'paciente_id', 'especialista_id', 'fecha',
            'rom_rodilla_flexion', 'rom_rodilla_extension',
            'rom_cadera_flexion', 'rom_cadera_extension',
            'rom_tobillo_dorsiflexion', 'rom_tobillo_plantiflexion',
            'fuerza_cuadriceps', 'fuerza_isquiotibiales',
            'fuerza_gluteos', 'fuerza_pantorrilla',
            'dolor_reposo', 'dolor_movimiento', 'dolor_carga',
            'test_equilibrio_unipodal', 'test_timed_up_go',
            'test_marcha_6min', 'test_berg_balance',
            'observaciones', 'notas_plan'
        ];

        $columns = [];
        $placeholders = [];
        $values = [];

        foreach ($fields as $field) {
            if (isset($data[$field]) || $field === 'paciente_id' || $field === 'especialista_id' || $field === 'fecha') {
                $columns[] = $field;
                $placeholders[] = '?';
                $values[] = $data[$field] ?? null;
            }
        }

        $query = "INSERT INTO " . self::$table . " (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $db->query($query, $values);

        return $db->lastInsertId();
    }

    public static function update($id, $data)
    {
        $db = DatabaseService::getInstance();

        $allowedFields = [
            'fecha', 'rom_rodilla_flexion', 'rom_rodilla_extension',
            'rom_cadera_flexion', 'rom_cadera_extension',
            'rom_tobillo_dorsiflexion', 'rom_tobillo_plantiflexion',
            'fuerza_cuadriceps', 'fuerza_isquiotibiales',
            'fuerza_gluteos', 'fuerza_pantorrilla',
            'dolor_reposo', 'dolor_movimiento', 'dolor_carga',
            'test_equilibrio_unipodal', 'test_timed_up_go',
            'test_marcha_6min', 'test_berg_balance',
            'observaciones', 'notas_plan'
        ];

        $sets = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($sets)) return false;

        $values[] = $id;
        $query = "UPDATE " . self::$table . " SET " . implode(', ', $sets) . ", updated_at = NOW() WHERE id = ?";

        return $db->query($query, $values);
    }

    public static function delete($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
