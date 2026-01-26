<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Utils\Response;

class EspecialistaController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Obtener citas de hoy para un especialista
     */
    public function getCitasHoy($especialistaId)
    {
        $citas = $this->db->query(
            "SELECT c.id, c.paciente_id, TIME_FORMAT(c.hora_inicio, '%H:%i') as hora,
                    u.nombre_completo as paciente,
                    COALESCE(tc.nombre, 'Consulta General') as tipo,
                    c.estado, c.notas_consulta as notas, c.motivo
             FROM citas c
             INNER JOIN pacientes p ON c.paciente_id = p.id
             INNER JOIN usuarios u ON p.usuario_id = u.id
             LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             WHERE c.especialista_id = ? AND c.fecha = CURDATE()
             ORDER BY c.hora_inicio ASC",
            [$especialistaId]
        )->fetchAll();

        return Response::success(['citas' => $citas]);
    }

    /**
     * Verificar si el especialista tiene acceso al paciente
     * (por asignación O por tener citas con él)
     */
    private function tieneAccesoPaciente($especialistaId, $pacienteId)
    {
        // Verificar asignación activa
        $asignacion = $this->db->query(
            "SELECT id FROM asignaciones_especialista
             WHERE especialista_id = ? AND paciente_id = ? AND activo = 1",
            [$especialistaId, $pacienteId]
        )->fetch();

        if ($asignacion) {
            return true;
        }

        // Verificar si tiene citas con el paciente
        $cita = $this->db->query(
            "SELECT id FROM citas
             WHERE especialista_id = ? AND paciente_id = ?
             LIMIT 1",
            [$especialistaId, $pacienteId]
        )->fetch();

        return $cita ? true : false;
    }

    /**
     * Obtener o crear asignación para un paciente
     */
    private function obtenerOCrearAsignacion($especialistaId, $pacienteId)
    {
        $asignacion = $this->db->query(
            "SELECT * FROM asignaciones_especialista
             WHERE especialista_id = ? AND paciente_id = ?",
            [$especialistaId, $pacienteId]
        )->fetch();

        if (!$asignacion) {
            // Crear asignación automática
            $this->db->query(
                "INSERT INTO asignaciones_especialista (especialista_id, paciente_id, fecha_asignacion, activo, created_at)
                 VALUES (?, ?, CURDATE(), 1, NOW())",
                [$especialistaId, $pacienteId]
            );
            $asignacion = [
                'id' => $this->db->lastInsertId(),
                'especialista_id' => $especialistaId,
                'paciente_id' => $pacienteId,
                'fecha_asignacion' => date('Y-m-d'),
                'activo' => 1,
                'notas' => ''
            ];
        } elseif (!$asignacion['activo']) {
            // Reactivar asignación
            $this->db->query(
                "UPDATE asignaciones_especialista SET activo = 1 WHERE id = ?",
                [$asignacion['id']]
            );
            $asignacion['activo'] = 1;
        }

        return $asignacion;
    }

    /**
     * Obtener pacientes del especialista (asignados + con citas)
     */
    public function getPacientes($especialistaId)
    {
        // Total de pacientes únicos (asignados + con citas)
        $totalPacientes = $this->db->query(
            "SELECT COUNT(DISTINCT paciente_id) as total FROM (
                SELECT paciente_id FROM asignaciones_especialista WHERE especialista_id = ? AND activo = 1
                UNION
                SELECT paciente_id FROM citas WHERE especialista_id = ?
             ) as todos_pacientes",
            [$especialistaId, $especialistaId]
        )->fetch();

        // Pacientes con seguimientos pendientes (sin cita en la última semana)
        $pendientes = $this->db->query(
            "SELECT COUNT(DISTINCT p.id) as total
             FROM pacientes p
             WHERE p.id IN (
                SELECT paciente_id FROM asignaciones_especialista WHERE especialista_id = ? AND activo = 1
                UNION
                SELECT paciente_id FROM citas WHERE especialista_id = ?
             )
             AND NOT EXISTS (
                 SELECT 1 FROM citas c
                 WHERE c.paciente_id = p.id
                 AND c.especialista_id = ?
                 AND c.fecha > DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             )",
            [$especialistaId, $especialistaId, $especialistaId]
        )->fetch();

        // Lista de todos los pacientes (asignados + con citas)
        $pacientes = $this->db->query(
            "SELECT DISTINCT p.id, p.usuario_id, u.nombre_completo as nombre, u.email,
                    f.nombre as fase_actual,
                    (SELECT ae.fecha_asignacion FROM asignaciones_especialista ae
                     WHERE ae.paciente_id = p.id AND ae.especialista_id = ? LIMIT 1) as fecha_asignacion,
                    (SELECT MAX(c.fecha) FROM citas c
                     WHERE c.paciente_id = p.id AND c.especialista_id = ?) as ultima_cita
             FROM pacientes p
             INNER JOIN usuarios u ON p.usuario_id = u.id
             LEFT JOIN fases_tratamiento f ON p.fase_actual_id = f.id
             WHERE p.id IN (
                SELECT paciente_id FROM asignaciones_especialista WHERE especialista_id = ? AND activo = 1
                UNION
                SELECT paciente_id FROM citas WHERE especialista_id = ?
             )
             ORDER BY ultima_cita DESC",
            [$especialistaId, $especialistaId, $especialistaId, $especialistaId]
        )->fetchAll();

        return Response::success([
            'total' => (int)($totalPacientes['total'] ?? 0),
            'pendientes' => (int)($pendientes['total'] ?? 0),
            'pacientes' => $pacientes
        ]);
    }

    /**
     * Obtener detalle de un paciente específico
     */
    public function getPacienteDetalle($especialistaId, $pacienteId)
    {
        // Verificar acceso (asignación O citas)
        if (!$this->tieneAccesoPaciente($especialistaId, $pacienteId)) {
            return Response::error('No tienes acceso a este paciente', 403);
        }

        // Obtener o crear asignación automáticamente
        $asignacion = $this->obtenerOCrearAsignacion($especialistaId, $pacienteId);

        // Datos del paciente
        $paciente = $this->db->query(
            "SELECT p.id, u.nombre_completo, u.email, u.fecha_nacimiento,
                    f.nombre as fase_actual, p.created_at as fecha_registro
             FROM pacientes p
             INNER JOIN usuarios u ON p.usuario_id = u.id
             LEFT JOIN fases_tratamiento f ON p.fase_actual_id = f.id
             WHERE p.id = ?",
            [$pacienteId]
        )->fetch();

        // Todas las citas con este especialista
        $citas = $this->db->query(
            "SELECT c.id, c.fecha, TIME_FORMAT(c.hora_inicio, '%H:%i') as hora,
                    tc.nombre as tipo, c.estado, c.notas_consulta as notas
             FROM citas c
             INNER JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             WHERE c.paciente_id = ? AND c.especialista_id = ?
             ORDER BY c.fecha DESC, c.hora_inicio DESC",
            [$pacienteId, $especialistaId]
        )->fetchAll();

        return Response::success([
            'paciente' => $paciente,
            'citas' => $citas,
            'asignacion' => $asignacion
        ]);
    }

    /**
     * Actualizar notas de seguimiento de un paciente
     */
    public function actualizarSeguimiento($especialistaId, $pacienteId, $data)
    {
        // Verificar acceso (asignación O citas)
        if (!$this->tieneAccesoPaciente($especialistaId, $pacienteId)) {
            return Response::error('No tienes acceso a este paciente', 403);
        }

        // Obtener o crear asignación automáticamente
        $asignacion = $this->obtenerOCrearAsignacion($especialistaId, $pacienteId);

        // Actualizar notas
        $this->db->query(
            "UPDATE asignaciones_especialista SET notas = ? WHERE id = ?",
            [$data['notas'] ?? '', $asignacion['id']]
        );

        return Response::success(null, 'Seguimiento actualizado');
    }

    /**
     * Obtener resumen del dashboard del especialista
     */
    public function getDashboardResumen($especialistaId)
    {
        // Citas de hoy
        $citasHoy = $this->db->query(
            "SELECT COUNT(*) as total FROM citas
             WHERE especialista_id = ? AND fecha = CURDATE()",
            [$especialistaId]
        )->fetch();

        // Pacientes activos (asignados + con citas)
        $pacientesActivos = $this->db->query(
            "SELECT COUNT(DISTINCT paciente_id) as total FROM (
                SELECT paciente_id FROM asignaciones_especialista WHERE especialista_id = ? AND activo = 1
                UNION
                SELECT paciente_id FROM citas WHERE especialista_id = ?
             ) as todos_pacientes",
            [$especialistaId, $especialistaId]
        )->fetch();

        // Seguimientos pendientes (pacientes sin cita en última semana)
        $seguimientosPendientes = $this->db->query(
            "SELECT COUNT(DISTINCT p.id) as total
             FROM pacientes p
             WHERE p.id IN (
                SELECT paciente_id FROM asignaciones_especialista WHERE especialista_id = ? AND activo = 1
                UNION
                SELECT paciente_id FROM citas WHERE especialista_id = ?
             )
             AND NOT EXISTS (
                 SELECT 1 FROM citas c
                 WHERE c.paciente_id = p.id
                 AND c.especialista_id = ?
                 AND c.fecha > DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             )",
            [$especialistaId, $especialistaId, $especialistaId]
        )->fetch();

        // Citas programadas pendientes de confirmar
        $citasPendientes = $this->db->query(
            "SELECT COUNT(*) as total FROM citas
             WHERE especialista_id = ? AND fecha >= CURDATE() AND estado = 'programada'",
            [$especialistaId]
        )->fetch();

        return Response::success([
            'citas_hoy' => (int)($citasHoy['total'] ?? 0),
            'pacientes_activos' => (int)($pacientesActivos['total'] ?? 0),
            'seguimientos_pendientes' => (int)($seguimientosPendientes['total'] ?? 0),
            'citas_pendientes' => (int)($citasPendientes['total'] ?? 0)
        ]);
    }
}
