<?php

namespace App\Controllers;

use App\Services\MicrosoftGraphService;
use App\Services\DatabaseService;
use App\Utils\Response;

/**
 * Controlador para integración de calendario con Microsoft Outlook
 */
class OutlookCalendarController
{
    private $graphService;
    private $db;

    public function __construct()
    {
        $this->graphService = new MicrosoftGraphService();
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Verificar si Microsoft está configurado
     */
    public function checkStatus()
    {
        $enabled = $_ENV['MICROSOFT_ENABLED'] ?? 'false';

        return Response::success([
            'configured' => $this->graphService->isConfigured(),
            'enabled' => $enabled === 'true'
        ]);
    }

    /**
     * Iniciar flujo de autorización OAuth
     */
    public function startAuth($userId)
    {
        if (!$this->graphService->isConfigured()) {
            return Response::error('Microsoft Graph API no está configurada', 400);
        }

        // Generar estado único para prevenir CSRF
        $state = bin2hex(random_bytes(16));

        // Guardar estado en sesión/DB para verificar después
        $this->db->query(
            "INSERT INTO oauth_states (user_id, state, provider, created_at, expires_at)
             VALUES (?, ?, 'microsoft', NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE))
             ON DUPLICATE KEY UPDATE state = ?, expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE)",
            [$userId, $state, $state]
        );

        $authUrl = $this->graphService->getAuthorizationUrl($state);

        return Response::success([
            'auth_url' => $authUrl,
            'state' => $state
        ]);
    }

    /**
     * Callback de autorización OAuth
     */
    public function handleCallback()
    {
        $code = $_GET['code'] ?? null;
        $state = $_GET['state'] ?? null;
        $error = $_GET['error'] ?? null;

        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';

        if ($error) {
            header("Location: {$frontendUrl}/especialista?outlook_error=" . urlencode($error));
            exit;
        }

        if (!$code || !$state) {
            header("Location: {$frontendUrl}/especialista?outlook_error=missing_params");
            exit;
        }

        // Verificar estado
        $stateRecord = $this->db->query(
            "SELECT user_id FROM oauth_states
             WHERE state = ? AND provider = 'microsoft' AND expires_at > NOW()",
            [$state]
        )->fetch();

        if (!$stateRecord) {
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
            header("Location: {$frontendUrl}/especialista?outlook_error=invalid_state");
            exit;
        }

        $userId = $stateRecord['user_id'];

        // Intercambiar código por tokens
        $tokens = $this->graphService->getTokenFromCode($code);

        if (!$tokens) {
            $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
            header("Location: {$frontendUrl}/especialista?outlook_error=token_exchange_failed");
            exit;
        }

        // Obtener info del usuario de Microsoft
        $msUser = $this->graphService->getUserInfo($tokens['access_token']);

        // Guardar tokens en la base de datos (encriptados)
        $this->saveUserTokens($userId, $tokens, $msUser);

        // Limpiar estado usado
        $this->db->query("DELETE FROM oauth_states WHERE state = ?", [$state]);

        // Redirigir al frontend con éxito (al dashboard del especialista)
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
        header("Location: {$frontendUrl}/especialista?outlook_connected=true");
        exit;
    }

    /**
     * Desconectar cuenta de Outlook
     */
    public function disconnect($userId)
    {
        $this->db->query(
            "DELETE FROM integraciones_usuario WHERE usuario_id = ? AND proveedor = 'microsoft'",
            [$userId]
        );

        return Response::success(null, 'Cuenta de Outlook desconectada');
    }

    /**
     * Verificar si el usuario tiene Outlook conectado
     */
    public function isConnected($userId)
    {
        $token = $this->db->query(
            "SELECT id, email_externo, created_at FROM integraciones_usuario
             WHERE usuario_id = ? AND proveedor = 'microsoft'",
            [$userId]
        )->fetch();

        return Response::success([
            'connected' => (bool)$token,
            'email' => $token['email_externo'] ?? null,
            'connected_at' => $token['created_at'] ?? null
        ]);
    }

    /**
     * Crear evento en Outlook desde una cita de Vitalia
     */
    public function syncCitaToOutlook($userId, $citaId)
    {
        // Obtener token del usuario
        $accessToken = $this->getValidAccessToken($userId);

        if (!$accessToken) {
            return Response::error('No hay conexión con Outlook. Por favor conecta tu cuenta.', 403);
        }

        // Obtener datos de la cita
        $cita = $this->db->query(
            "SELECT c.*, tc.nombre as tipo_cita_nombre, tc.duracion_minutos,
                    u_esp.nombre_completo as especialista_nombre, u_esp.email as especialista_email,
                    u_pac.nombre_completo as paciente_nombre, u_pac.email as paciente_email
             FROM citas c
             LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             LEFT JOIN usuarios u_esp ON c.especialista_id = u_esp.id
             LEFT JOIN pacientes p ON c.paciente_id = p.id
             LEFT JOIN usuarios u_pac ON p.usuario_id = u_pac.id
             WHERE c.id = ?",
            [$citaId]
        )->fetch();

        if (!$cita) {
            return Response::error('Cita no encontrada', 404);
        }

        // Calcular fecha/hora de fin
        $inicio = new \DateTime($cita['fecha'] . ' ' . $cita['hora_inicio']);
        $duracion = $cita['duracion_minutos'] ?? 30;
        $fin = clone $inicio;
        $fin->modify("+{$duracion} minutes");

        // Preparar datos del evento
        $eventData = [
            'titulo' => "Cita: {$cita['tipo_cita_nombre']} - Vitalia",
            'fecha_inicio' => $inicio->format('Y-m-d\TH:i:s'),
            'fecha_fin' => $fin->format('Y-m-d\TH:i:s'),
            'tipo_cita' => $cita['tipo_cita_nombre'],
            'especialista' => $cita['especialista_nombre'],
            'paciente' => $cita['paciente_nombre'],
            'notas' => $cita['notas'] ?? '',
            'ubicacion' => $cita['ubicacion'] ?? 'Centro de Rehabilitación Vitalia',
            'es_virtual' => $cita['modalidad'] === 'virtual',
            'recordatorio_minutos' => 60,
            'asistentes' => []
        ];

        // Agregar especialista como asistente si tiene email
        if (!empty($cita['especialista_email'])) {
            $eventData['asistentes'][] = [
                'email' => $cita['especialista_email'],
                'nombre' => $cita['especialista_nombre']
            ];
        }

        // Crear evento en Outlook
        $result = $this->graphService->createCalendarEvent($accessToken, $eventData);

        if (!$result) {
            return Response::error('Error al crear evento en Outlook', 500);
        }

        // Guardar referencia del evento de Outlook
        $this->db->query(
            "UPDATE citas SET outlook_event_id = ?, outlook_synced_at = NOW() WHERE id = ?",
            [$result['event_id'], $citaId]
        );

        return Response::success([
            'event_id' => $result['event_id'],
            'web_link' => $result['web_link'],
            'online_meeting' => $result['online_meeting']
        ], 'Cita sincronizada con Outlook');
    }

    /**
     * Obtener eventos del calendario de Outlook
     */
    public function getOutlookEvents($userId, $startDate, $endDate)
    {
        $accessToken = $this->getValidAccessToken($userId);

        if (!$accessToken) {
            return Response::error('No hay conexión con Outlook', 403);
        }

        $events = $this->graphService->getCalendarEvents($accessToken, $startDate, $endDate);

        if ($events === null) {
            return Response::error('Error al obtener eventos de Outlook', 500);
        }

        return Response::success($events);
    }

    /**
     * Obtener disponibilidad
     */
    public function getAvailability($userId, $data)
    {
        $accessToken = $this->getValidAccessToken($userId);

        if (!$accessToken) {
            return Response::error('No hay conexión con Outlook', 403);
        }

        $emails = $data['emails'] ?? [];
        $startDate = $data['fecha_inicio'] ?? date('Y-m-d\TH:i:s');
        $endDate = $data['fecha_fin'] ?? date('Y-m-d\TH:i:s', strtotime('+7 days'));

        $availability = $this->graphService->getScheduleAvailability($accessToken, $emails, $startDate, $endDate);

        if ($availability === null) {
            return Response::error('Error al obtener disponibilidad', 500);
        }

        return Response::success($availability);
    }

    /**
     * Actualizar evento en Outlook
     */
    public function updateOutlookEvent($userId, $citaId)
    {
        $accessToken = $this->getValidAccessToken($userId);

        if (!$accessToken) {
            return Response::error('No hay conexión con Outlook', 403);
        }

        // Obtener cita y su evento de Outlook
        $cita = $this->db->query(
            "SELECT c.*, tc.nombre as tipo_cita_nombre, tc.duracion_minutos
             FROM citas c
             LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
             WHERE c.id = ? AND c.outlook_event_id IS NOT NULL",
            [$citaId]
        )->fetch();

        if (!$cita) {
            return Response::error('Cita no encontrada o no sincronizada con Outlook', 404);
        }

        $inicio = new \DateTime($cita['fecha'] . ' ' . $cita['hora_inicio']);
        $duracion = $cita['duracion_minutos'] ?? 30;
        $fin = clone $inicio;
        $fin->modify("+{$duracion} minutes");

        $eventData = [
            'titulo' => "Cita: {$cita['tipo_cita_nombre']} - Vitalia",
            'fecha_inicio' => $inicio->format('Y-m-d\TH:i:s'),
            'fecha_fin' => $fin->format('Y-m-d\TH:i:s')
        ];

        $result = $this->graphService->updateCalendarEvent($accessToken, $cita['outlook_event_id'], $eventData);

        if (!$result) {
            return Response::error('Error al actualizar evento en Outlook', 500);
        }

        $this->db->query("UPDATE citas SET outlook_synced_at = NOW() WHERE id = ?", [$citaId]);

        return Response::success(null, 'Evento actualizado en Outlook');
    }

    /**
     * Eliminar evento de Outlook
     */
    public function deleteOutlookEvent($userId, $citaId)
    {
        $accessToken = $this->getValidAccessToken($userId);

        if (!$accessToken) {
            return Response::error('No hay conexión con Outlook', 403);
        }

        $cita = $this->db->query(
            "SELECT outlook_event_id FROM citas WHERE id = ?",
            [$citaId]
        )->fetch();

        if (!$cita || !$cita['outlook_event_id']) {
            return Response::error('Cita no tiene evento de Outlook asociado', 404);
        }

        $result = $this->graphService->deleteCalendarEvent($accessToken, $cita['outlook_event_id']);

        // Limpiar referencia aunque falle (el evento puede haber sido eliminado manualmente)
        $this->db->query(
            "UPDATE citas SET outlook_event_id = NULL, outlook_synced_at = NULL WHERE id = ?",
            [$citaId]
        );

        return Response::success(null, 'Evento eliminado de Outlook');
    }

    /**
     * Guardar tokens del usuario
     */
    private function saveUserTokens($userId, array $tokens, ?array $msUser)
    {
        // En producción, los tokens deberían estar encriptados
        $encryptedAccess = base64_encode($tokens['access_token']);
        $encryptedRefresh = $tokens['refresh_token'] ? base64_encode($tokens['refresh_token']) : null;
        $expiresAt = date('Y-m-d H:i:s', time() + ($tokens['expires_in'] ?? 3600));

        $this->db->query(
            "INSERT INTO integraciones_usuario (usuario_id, proveedor, access_token, refresh_token, expira_en, email_externo)
             VALUES (?, 'microsoft', ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                access_token = ?, refresh_token = ?, expira_en = ?, email_externo = ?, updated_at = NOW()",
            [
                $userId, $encryptedAccess, $encryptedRefresh, $expiresAt, $msUser['mail'] ?? $msUser['userPrincipalName'] ?? null,
                $encryptedAccess, $encryptedRefresh, $expiresAt, $msUser['mail'] ?? $msUser['userPrincipalName'] ?? null
            ]
        );
    }

    /**
     * Obtener token de acceso válido (refrescando si es necesario)
     */
    private function getValidAccessToken($userId): ?string
    {
        $tokenRecord = $this->db->query(
            "SELECT access_token, refresh_token, expira_en FROM integraciones_usuario
             WHERE usuario_id = ? AND proveedor = 'microsoft'",
            [$userId]
        )->fetch();

        if (!$tokenRecord) {
            return null;
        }

        $accessToken = base64_decode($tokenRecord['access_token']);
        $expiresAt = strtotime($tokenRecord['expira_en']);

        // Si el token expira en menos de 5 minutos, refrescar
        if ($expiresAt < time() + 300 && $tokenRecord['refresh_token']) {
            $refreshToken = base64_decode($tokenRecord['refresh_token']);
            $newTokens = $this->graphService->refreshToken($refreshToken);

            if ($newTokens) {
                $this->db->query(
                    "UPDATE integraciones_usuario SET
                        access_token = ?,
                        refresh_token = ?,
                        expira_en = ?
                     WHERE usuario_id = ? AND proveedor = 'microsoft'",
                    [
                        base64_encode($newTokens['access_token']),
                        base64_encode($newTokens['refresh_token']),
                        date('Y-m-d H:i:s', time() + $newTokens['expires_in']),
                        $userId
                    ]
                );
                return $newTokens['access_token'];
            }

            // Si no se pudo refrescar, el token ya no es válido
            return null;
        }

        return $accessToken;
    }
}
