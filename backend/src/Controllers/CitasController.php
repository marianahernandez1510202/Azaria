<?php

namespace App\Controllers;

use App\Models\Cita;
use App\Services\GoogleCalendarService;
use App\Services\EmailService;
use App\Services\DatabaseService;
use App\Utils\Response;
use App\Utils\Validator;

class CitasController
{
    private $calendarService;
    private $emailService;
    private $db;

    public function __construct()
    {
        $this->calendarService = new GoogleCalendarService();
        $this->emailService = new EmailService();
        $this->db = DatabaseService::getInstance();
    }

    // ===== NUEVOS MÉTODOS PARA ESPECIALISTA =====

    /**
     * Obtener tipos de cita disponibles
     */
    public function getTiposCita()
    {
        $tipos = $this->db->query(
            "SELECT id, nombre, duracion_minutos, descripcion FROM tipos_cita ORDER BY nombre"
        )->fetchAll();

        return Response::success(['tipos' => $tipos]);
    }

    /**
     * Crear nueva cita desde el especialista
     */
    public function crearCitaEspecialista($data)
    {
        error_log("=== INICIO crearCitaEspecialista ===");
        error_log("Datos recibidos: " . json_encode($data));

        // Validar datos requeridos
        $required = ['paciente_id', 'especialista_id', 'fecha', 'hora_inicio', 'tipo_cita_id'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                error_log("Campo requerido faltante: $field");
                return Response::error("El campo $field es requerido", 422);
            }
        }

        // Verificar que no exista cita en ese horario
        $citaExistente = $this->db->query(
            "SELECT id FROM citas
             WHERE especialista_id = ? AND fecha = ? AND hora_inicio = ? AND estado != 'cancelada'",
            [$data['especialista_id'], $data['fecha'], $data['hora_inicio']]
        )->fetch();

        if ($citaExistente) {
            error_log("Ya existe cita en ese horario");
            return Response::error('Ya existe una cita programada en ese horario', 422);
        }

        // Obtener duración del tipo de cita
        $tipoCita = $this->db->query(
            "SELECT duracion_minutos FROM tipos_cita WHERE id = ?",
            [$data['tipo_cita_id']]
        )->fetch();

        $duracion = $tipoCita['duracion_minutos'] ?? 30;

        // Obtener area_medica_id del especialista
        $especialista = $this->db->query(
            "SELECT area_medica_id FROM usuarios WHERE id = ?",
            [$data['especialista_id']]
        )->fetch();

        $areaMedicaId = $especialista['area_medica_id'] ?? 1; // Default a 1 si no tiene
        error_log("area_medica_id del especialista: $areaMedicaId");

        // Calcular hora fin
        $horaInicio = new \DateTime($data['hora_inicio']);
        $horaFin = clone $horaInicio;
        $horaFin->add(new \DateInterval("PT{$duracion}M"));

        // Insertar cita
        $this->db->query(
            "INSERT INTO citas (paciente_id, especialista_id, area_medica_id, fecha, hora_inicio, hora_fin, tipo_cita_id, estado, motivo, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'programada', ?, NOW())",
            [
                $data['paciente_id'],
                $data['especialista_id'],
                $areaMedicaId,
                $data['fecha'],
                $data['hora_inicio'],
                $horaFin->format('H:i:s'),
                $data['tipo_cita_id'],
                $data['motivo'] ?? null
            ]
        );

        $citaId = $this->db->lastInsertId();
        error_log("=== CITA CREADA CON ID: $citaId ===");

        return Response::success(['id' => $citaId], 'Cita agendada exitosamente', 201);
    }

    /**
     * Obtener horarios disponibles de un especialista para una fecha
     */
    public function getHorariosDisponibles($especialistaId, $fecha)
    {
        // Horarios de trabajo estándar (8:00 a 18:00, cada 30 min)
        $horariosBase = [];
        $hora = new \DateTime('08:00');
        $fin = new \DateTime('18:00');

        while ($hora < $fin) {
            $horariosBase[] = $hora->format('H:i');
            $hora->add(new \DateInterval('PT30M'));
        }

        // Obtener citas existentes para esa fecha
        $citasOcupadas = $this->db->query(
            "SELECT TIME_FORMAT(hora_inicio, '%H:%i') as hora
             FROM citas
             WHERE especialista_id = ? AND fecha = ? AND estado != 'cancelada'",
            [$especialistaId, $fecha]
        )->fetchAll();

        $horasOcupadas = array_column($citasOcupadas, 'hora');

        // Filtrar horarios disponibles
        $horariosDisponibles = array_values(array_diff($horariosBase, $horasOcupadas));

        return Response::success(['horarios' => $horariosDisponibles]);
    }

    /**
     * Obtener citas del especialista por fecha
     */
    public function getCitasEspecialistaFecha($especialistaId, $fecha = null)
    {
        $params = [$especialistaId];
        $fechaCondition = "";

        if ($fecha) {
            $fechaCondition = "AND c.fecha = ?";
            $params[] = $fecha;
        } else {
            // Por defecto, citas de hoy en adelante
            $fechaCondition = "AND c.fecha >= CURDATE()";
        }

        $citas = $this->db->query(
            "SELECT c.id, c.paciente_id, c.fecha, TIME_FORMAT(c.hora_inicio, '%H:%i') as hora_inicio,
                    TIME_FORMAT(c.hora_fin, '%H:%i') as hora_fin, c.estado, c.motivo,
                    c.notas_consulta, tc.nombre as tipo_cita, tc.id as tipo_cita_id,
                    u.nombre_completo as paciente_nombre, u.email as paciente_email
             FROM citas c
             INNER JOIN pacientes p ON c.paciente_id = p.id
             INNER JOIN usuarios u ON p.usuario_id = u.id
             INNER JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             WHERE c.especialista_id = ? $fechaCondition
             ORDER BY c.fecha ASC, c.hora_inicio ASC",
            $params
        )->fetchAll();

        return Response::success(['citas' => $citas]);
    }

    /**
     * Actualizar estado de una cita
     */
    public function actualizarEstadoCita($citaId, $data)
    {
        $estadosValidos = ['programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'no_asistio'];

        if (empty($data['estado']) || !in_array($data['estado'], $estadosValidos)) {
            return Response::error('Estado no válido', 422);
        }

        $this->db->query(
            "UPDATE citas SET estado = ? WHERE id = ?",
            [$data['estado'], $citaId]
        );

        return Response::success(null, 'Estado actualizado');
    }

    /**
     * Agregar notas a una cita
     */
    public function agregarNotasCita($citaId, $data)
    {
        $this->db->query(
            "UPDATE citas SET notas_consulta = ? WHERE id = ?",
            [$data['notas'] ?? '', $citaId]
        );

        return Response::success(null, 'Notas guardadas');
    }

    // AGENDAR CITA
    public function agendarCita($data)
    {
        error_log("=== INICIO agendarCita ===");
        error_log("Datos recibidos: " . json_encode($data));

        // Normalizar datos: el frontend envía fecha_hora combinada
        if (isset($data['fecha_hora']) && !isset($data['fecha'])) {
            $dateTime = new \DateTime($data['fecha_hora']);
            $data['fecha'] = $dateTime->format('Y-m-d');
            $data['hora'] = $dateTime->format('H:i:s');
            error_log("Fecha/hora normalizadas - fecha: {$data['fecha']}, hora: {$data['hora']}");
        }

        // El frontend envía 'tipo', usarlo como especialidad si no existe
        if (isset($data['tipo']) && !isset($data['especialidad'])) {
            $data['especialidad'] = $data['tipo'];
        }

        error_log("Datos después de normalizar: " . json_encode($data));

        $validator = new Validator($data);
        $validator->required(['paciente_id', 'especialista_id', 'fecha', 'hora']);

        if (!$validator->passes()) {
            error_log("Validación fallida: " . json_encode($validator->errors()));
            return Response::error($validator->errors(), 422);
        }

        error_log("Validación pasada. Verificando disponibilidad...");

        // Verificar disponibilidad
        if (!Cita::isAvailable($data['especialista_id'], $data['fecha'], $data['hora'])) {
            error_log("Horario NO disponible para especialista_id: {$data['especialista_id']}, fecha: {$data['fecha']}, hora: {$data['hora']}");
            return Response::error('El horario no está disponible', 409);
        }

        error_log("Horario disponible. Creando cita...");

        // Crear cita
        $result = Cita::create($data);
        error_log("Resultado de Cita::create(): " . json_encode($result));

        if ($result) {
            error_log("=== CITA CREADA EXITOSAMENTE ===");
            error_log("ID de cita creada: " . ($result['id'] ?? 'N/A'));

            try {
                // Sincronizar con Google Calendar (si está configurado)
                $calendarEventId = $this->calendarService->createEvent([
                    'summary' => "Cita - " . ($data['especialidad'] ?? 'Consulta'),
                    'description' => $data['motivo'] ?? '',
                    'start' => $data['fecha'] . 'T' . $data['hora'],
                    'end' => $data['fecha'] . 'T' . $this->calcularHoraFin($data['hora'])
                ]);

                if ($calendarEventId) {
                    Cita::updateCalendarEventId($result['id'], $calendarEventId);
                }
            } catch (\Exception $e) {
                // Si falla Google Calendar, continuar sin error
                error_log('Google Calendar sync failed: ' . $e->getMessage());
            }

            try {
                // Enviar email de confirmación
                $this->emailService->sendCitaConfirmacion($result);
            } catch (\Exception $e) {
                // Si falla el email, continuar sin error
                error_log('Email notification failed: ' . $e->getMessage());
            }

            error_log("=== FIN agendarCita - ÉXITO ===");
            return Response::success($result, 'Cita agendada exitosamente', 201);
        }

        error_log("=== FIN agendarCita - ERROR: result vacío ===");
        return Response::error('Error al agendar cita', 500);
    }

    // MIS CITAS
    public function getMisCitas($userId, $rol, $filters = [])
    {
        if ($rol === ROLE_PACIENTE) {
            $citas = Cita::getByPaciente($userId, $filters);
        } else {
            $citas = Cita::getByEspecialista($userId, $filters);
        }

        return Response::success($citas);
    }

    // DETALLE DE CITA
    public function getCita($id)
    {
        $cita = Cita::find($id);

        if (!$cita) {
            return Response::error('Cita no encontrada', 404);
        }

        return Response::success($cita);
    }

    // CANCELAR CITA
    public function cancelarCita($id, $data)
    {
        $validator = new Validator($data);
        $validator->required(['motivo_cancelacion']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $cita = Cita::find($id);

        if (!$cita) {
            return Response::error('Cita no encontrada', 404);
        }

        $result = Cita::cancel($id, $data['motivo_cancelacion']);

        if ($result) {
            // Eliminar de Google Calendar
            if ($cita['calendar_event_id']) {
                $this->calendarService->deleteEvent($cita['calendar_event_id']);
            }

            // Enviar email de cancelación
            $this->emailService->sendCitaCancelacion($cita);

            return Response::success(null, 'Cita cancelada exitosamente');
        }

        return Response::error('Error al cancelar cita', 500);
    }

    // REAGENDAR CITA
    public function reagendarCita($id, $data)
    {
        $validator = new Validator($data);
        $validator->required(['nueva_fecha', 'nueva_hora']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $cita = Cita::find($id);

        if (!$cita) {
            return Response::error('Cita no encontrada', 404);
        }

        // Verificar nueva disponibilidad
        if (!Cita::isAvailable($cita['especialista_id'], $data['nueva_fecha'], $data['nueva_hora'], $id)) {
            return Response::error('El nuevo horario no está disponible', 409);
        }

        $result = Cita::reschedule($id, $data['nueva_fecha'], $data['nueva_hora']);

        if ($result) {
            // Actualizar en Google Calendar
            if ($cita['calendar_event_id']) {
                $this->calendarService->updateEvent($cita['calendar_event_id'], [
                    'start' => $data['nueva_fecha'] . 'T' . $data['nueva_hora'],
                    'end' => $data['nueva_fecha'] . 'T' . $this->calcularHoraFin($data['nueva_hora'])
                ]);
            }

            // Enviar email de reagendamiento
            $this->emailService->sendCitaReagendada($cita, $data);

            return Response::success(null, 'Cita reagendada exitosamente');
        }

        return Response::error('Error al reagendar cita', 500);
    }

    // CALENDARIO DE DISPONIBILIDAD
    public function getDisponibilidad($especialistaId, $fecha)
    {
        $disponibilidad = Cita::getDisponibilidad($especialistaId, $fecha);
        return Response::success($disponibilidad);
    }

    // COMPLETAR CITA
    public function completarCita($id, $data)
    {
        $result = Cita::complete($id, $data['notas'] ?? null);

        if ($result) {
            return Response::success(null, 'Cita marcada como completada');
        }

        return Response::error('Error al completar cita', 500);
    }

    private function calcularHoraFin($horaInicio)
    {
        // Asume citas de 1 hora
        $time = strtotime($horaInicio);
        return date('H:i:s', strtotime('+1 hour', $time));
    }
}
