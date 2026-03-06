<?php
namespace App\Models;
use App\Services\DatabaseService;

class Cita {
    private static $table = 'citas';

    public static function find($id) {
        $db = DatabaseService::getInstance();
        return $db->query(
            "SELECT c.*,
                    u_pac.nombre_completo as paciente_nombre,
                    u_esp.nombre_completo as especialista_nombre,
                    tc.nombre as tipo_cita_nombre
             FROM citas c
             LEFT JOIN pacientes p ON c.paciente_id = p.id
             LEFT JOIN usuarios u_pac ON p.usuario_id = u_pac.id
             LEFT JOIN usuarios u_esp ON c.especialista_id = u_esp.id
             LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             WHERE c.id = ?",
            [$id]
        )->fetch();
    }

    public static function getAll() {
        $db = DatabaseService::getInstance();
        return $db->query("SELECT * FROM " . self::$table . " ORDER BY created_at DESC")->fetchAll();
    }

    public static function getByPaciente($userId, $filters = []) {
        $db = DatabaseService::getInstance();

        // Primero obtener el paciente_id del usuario
        $paciente = $db->query(
            "SELECT id FROM pacientes WHERE usuario_id = ?",
            [$userId]
        )->fetch();

        if (!$paciente) {
            return [];
        }

        return $db->query(
            "SELECT c.id, c.fecha, c.hora_inicio, c.hora_fin, c.estado, c.motivo,
                    CONCAT(c.fecha, 'T', c.hora_inicio) as fecha_hora,
                    u.nombre_completo as especialista_nombre,
                    tc.nombre as tipo_cita,
                    'medicina' as area_medica,
                    'presencial' as tipo
             FROM citas c
             INNER JOIN usuarios u ON c.especialista_id = u.id
             LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             WHERE c.paciente_id = ?
             ORDER BY c.fecha DESC, c.hora_inicio DESC",
            [$paciente['id']]
        )->fetchAll();
    }

    public static function getByEspecialista($especialistaId, $filters = []) {
        $db = DatabaseService::getInstance();

        return $db->query(
            "SELECT c.id, c.fecha, c.hora_inicio, c.hora_fin, c.estado, c.motivo,
                    CONCAT(c.fecha, 'T', c.hora_inicio) as fecha_hora,
                    u.nombre_completo as paciente_nombre,
                    tc.nombre as tipo_cita,
                    'medicina' as area_medica,
                    'presencial' as tipo
             FROM citas c
             INNER JOIN pacientes p ON c.paciente_id = p.id
             INNER JOIN usuarios u ON p.usuario_id = u.id
             LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             WHERE c.especialista_id = ?
             ORDER BY c.fecha DESC, c.hora_inicio DESC",
            [$especialistaId]
        )->fetchAll();
    }

    public static function isAvailable($especialistaId, $fecha, $hora, $excludeId = null) {
        $db = DatabaseService::getInstance();

        $params = [$especialistaId, $fecha, $hora];
        $excludeCondition = "";

        if ($excludeId) {
            $excludeCondition = " AND id != ?";
            $params[] = $excludeId;
        }

        $result = $db->query(
            "SELECT COUNT(*) as count FROM citas
             WHERE especialista_id = ? AND fecha = ? AND hora_inicio = ? AND estado != 'cancelada'" . $excludeCondition,
            $params
        )->fetch();

        return $result['count'] == 0;
    }

    public static function create($data) {
        $db = DatabaseService::getInstance();

        // Obtener paciente_id desde usuario_id si es necesario
        $pacienteId = $data['paciente_id'];

        $paciente = $db->query(
            "SELECT id FROM pacientes WHERE usuario_id = ?",
            [$pacienteId]
        )->fetch();

        if ($paciente) {
            $pacienteId = $paciente['id'];
        }

        $horaInicio = $data['hora'] ?? $data['hora_inicio'];
        $horaFin = date('H:i:s', strtotime($horaInicio . ' +1 hour'));

        // Obtener area_medica_id del especialista
        $areaMedicaId = $data['area_medica_id'] ?? null;
        if (!$areaMedicaId) {
            $esp = $db->query(
                "SELECT area_medica_id FROM usuarios WHERE id = ?",
                [$data['especialista_id']]
            )->fetch();
            $areaMedicaId = $esp['area_medica_id'] ?? 1;
        }

        // Resolver tipo_cita_id (default: seguimiento = 2)
        $tipoCitaId = $data['tipo_cita_id'] ?? 2;

        try {
            $db->query(
                "INSERT INTO citas (paciente_id, especialista_id, area_medica_id, tipo_cita_id, fecha, hora_inicio, hora_fin, motivo, estado, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'programada', NOW())",
                [
                    $pacienteId,
                    $data['especialista_id'],
                    $areaMedicaId,
                    $tipoCitaId,
                    $data['fecha'],
                    $horaInicio,
                    $horaFin,
                    $data['motivo'] ?? null
                ]
            );

            return [
                'id' => $db->lastInsertId()
            ];
        } catch (\Exception $e) {
            error_log("Error al insertar cita: " . $e->getMessage());
            throw $e;
        }
    }

    public static function cancel($id, $motivo) {
        $db = DatabaseService::getInstance();
        $db->query(
            "UPDATE citas SET estado = 'cancelada', motivo_cancelacion = ? WHERE id = ?",
            [$motivo, $id]
        );
        return true;
    }

    public static function reschedule($id, $nuevaFecha, $nuevaHora) {
        $db = DatabaseService::getInstance();
        $horaFin = date('H:i:s', strtotime($nuevaHora . ' +1 hour'));

        $db->query(
            "UPDATE citas SET fecha = ?, hora_inicio = ?, hora_fin = ?, estado = 'reprogramada' WHERE id = ?",
            [$nuevaFecha, $nuevaHora, $horaFin, $id]
        );
        return true;
    }

    public static function complete($id, $notas = null) {
        $db = DatabaseService::getInstance();
        $db->query(
            "UPDATE citas SET estado = 'completada', notas_consulta = ? WHERE id = ?",
            [$notas, $id]
        );
        return true;
    }

    public static function getDisponibilidad($especialistaId, $fecha) {
        $db = DatabaseService::getInstance();

        // Horarios de trabajo estándar (8:00 a 18:00, cada 30 min)
        $horariosBase = [];
        $hora = strtotime('08:00');
        $fin = strtotime('18:00');

        while ($hora < $fin) {
            $horariosBase[] = date('H:i', $hora);
            $hora = strtotime('+30 minutes', $hora);
        }

        // Obtener citas existentes para esa fecha
        $citasOcupadas = $db->query(
            "SELECT TIME_FORMAT(hora_inicio, '%H:%i') as hora
             FROM citas
             WHERE especialista_id = ? AND fecha = ? AND estado != 'cancelada'",
            [$especialistaId, $fecha]
        )->fetchAll();

        $horasOcupadas = array_column($citasOcupadas, 'hora');

        // Filtrar horarios disponibles
        return array_values(array_diff($horariosBase, $horasOcupadas));
    }

    public static function updateCalendarEventId($id, $eventId) {
        $db = DatabaseService::getInstance();
        $db->query(
            "UPDATE citas SET calendar_event_id = ? WHERE id = ?",
            [$eventId, $id]
        );
    }

    public static function update($id, $data) {
        $db = DatabaseService::getInstance();
        // Implementar UPDATE según sea necesario
        return true;
    }

    public static function delete($id) {
        $db = DatabaseService::getInstance();
        return $db->query("DELETE FROM " . self::$table . " WHERE id = ?", [$id]);
    }
}
