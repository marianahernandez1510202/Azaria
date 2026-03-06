<?php

namespace App\Models;

use App\Services\DatabaseService;

class PlanTratamiento
{
    private static $table = 'planes_tratamiento';

    public static function find($id)
    {
        $db = DatabaseService::getInstance();

        $plan = $db->query(
            "SELECT pt.*,
                    up.nombre_completo as paciente_nombre,
                    u.nombre_completo as especialista_nombre
             FROM " . self::$table . " pt
             LEFT JOIN pacientes p ON pt.paciente_id = p.id
             LEFT JOIN usuarios up ON p.usuario_id = up.id
             LEFT JOIN usuarios u ON pt.especialista_id = u.id
             WHERE pt.id = ?",
            [$id]
        )->fetch();

        if ($plan) {
            $plan['ejercicios'] = self::getEjercicios($id);
        }

        return $plan;
    }

    public static function getByPaciente($pacienteId)
    {
        $db = DatabaseService::getInstance();

        $planes = $db->query(
            "SELECT pt.*,
                    u.nombre_completo as especialista_nombre,
                    (SELECT COUNT(*) FROM plan_tratamiento_ejercicios WHERE plan_id = pt.id) as total_ejercicios
             FROM " . self::$table . " pt
             LEFT JOIN usuarios u ON pt.especialista_id = u.id
             WHERE pt.paciente_id = ?
             ORDER BY pt.created_at DESC",
            [$pacienteId]
        )->fetchAll();

        return $planes;
    }

    public static function getByEspecialista($especialistaId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT pt.*,
                    up.nombre_completo as paciente_nombre,
                    (SELECT COUNT(*) FROM plan_tratamiento_ejercicios WHERE plan_id = pt.id) as total_ejercicios
             FROM " . self::$table . " pt
             LEFT JOIN pacientes p ON pt.paciente_id = p.id
             LEFT JOIN usuarios up ON p.usuario_id = up.id
             WHERE pt.especialista_id = ?
             ORDER BY pt.created_at DESC",
            [$especialistaId]
        )->fetchAll();
    }

    public static function create($data)
    {
        $db = DatabaseService::getInstance();

        $db->query(
            "INSERT INTO " . self::$table . "
             (paciente_id, especialista_id, nombre, objetivo, duracion_semanas, frecuencia_semanal, estado, notas, fecha_inicio, fecha_fin)
             VALUES (?, ?, ?, ?, ?, ?, 'activo', ?, ?, ?)",
            [
                $data['paciente_id'],
                $data['especialista_id'],
                $data['nombre'],
                $data['objetivo'] ?? null,
                $data['duracion_semanas'] ?? 4,
                $data['frecuencia_semanal'] ?? 3,
                $data['notas'] ?? null,
                $data['fecha_inicio'],
                $data['fecha_fin'] ?? null
            ]
        );

        $planId = $db->lastInsertId();

        if (!empty($data['ejercicios'])) {
            self::insertEjercicios($planId, $data['ejercicios']);
        }

        return $planId;
    }

    public static function update($id, $data)
    {
        $db = DatabaseService::getInstance();

        $allowedFields = ['nombre', 'objetivo', 'duracion_semanas', 'frecuencia_semanal', 'notas', 'fecha_inicio', 'fecha_fin'];
        $sets = [];
        $values = [];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (!empty($sets)) {
            $values[] = $id;
            $db->query(
                "UPDATE " . self::$table . " SET " . implode(', ', $sets) . ", updated_at = NOW() WHERE id = ?",
                $values
            );
        }

        if (isset($data['ejercicios'])) {
            $db->query("DELETE FROM plan_tratamiento_ejercicios WHERE plan_id = ?", [$id]);
            self::insertEjercicios($id, $data['ejercicios']);
        }

        return true;
    }

    public static function updateEstado($id, $estado)
    {
        $db = DatabaseService::getInstance();
        $estadosValidos = ['activo', 'pausado', 'completado', 'cancelado'];

        if (!in_array($estado, $estadosValidos)) {
            return false;
        }

        $extra = '';
        if ($estado === 'completado' || $estado === 'cancelado') {
            $extra = ', fecha_fin = CURDATE()';
        }

        return $db->query(
            "UPDATE " . self::$table . " SET estado = ?" . $extra . ", updated_at = NOW() WHERE id = ?",
            [$estado, $id]
        );
    }

    public static function delete($id)
    {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }

    private static function getEjercicios($planId)
    {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT pte.*, v.titulo, v.descripcion as video_descripcion, v.youtube_url, v.thumbnail_url,
                    v.duracion_minutos, n.nombre as nivel_nombre, c.nombre as categoria_nombre
             FROM plan_tratamiento_ejercicios pte
             JOIN videos_ejercicios v ON pte.video_id = v.id
             LEFT JOIN niveles_ejercicio n ON v.nivel_id = n.id
             LEFT JOIN categorias_ejercicio c ON v.categoria_id = c.id
             WHERE pte.plan_id = ?
             ORDER BY pte.orden ASC",
            [$planId]
        )->fetchAll();
    }

    private static function insertEjercicios($planId, $ejercicios)
    {
        $db = DatabaseService::getInstance();

        foreach ($ejercicios as $index => $ej) {
            $db->query(
                "INSERT INTO plan_tratamiento_ejercicios (plan_id, video_id, orden, series, repeticiones, duracion_segundos, descanso_segundos, notas)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $planId,
                    $ej['video_id'],
                    $ej['orden'] ?? $index,
                    $ej['series'] ?? 3,
                    $ej['repeticiones'] ?? '10',
                    $ej['duracion_segundos'] ?? null,
                    $ej['descanso_segundos'] ?? 30,
                    $ej['notas'] ?? null
                ]
            );
        }
    }
}
