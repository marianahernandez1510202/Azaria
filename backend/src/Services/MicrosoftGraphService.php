<?php

namespace App\Services;

/**
 * Servicio para integración con Microsoft Graph API
 * Permite agendar citas en calendarios de Outlook
 */
class MicrosoftGraphService
{
    private $clientId;
    private $clientSecret;
    private $tenantId;
    private $redirectUri;
    private $graphApiUrl = 'https://graph.microsoft.com/v1.0';
    private $authUrl = 'https://login.microsoftonline.com';

    public function __construct()
    {
        $this->clientId = $_ENV['MICROSOFT_CLIENT_ID'] ?? null;
        $this->clientSecret = $_ENV['MICROSOFT_CLIENT_SECRET'] ?? null;
        // Usar 'consumers' para permitir solo cuentas personales (outlook.com, hotmail.com, live.com)
        // Esto evita el requisito de aprobación de administrador de cuentas organizacionales
        $this->tenantId = $_ENV['MICROSOFT_TENANT_ID'] ?? 'consumers';
        $this->redirectUri = $_ENV['MICROSOFT_REDIRECT_URI'] ?? 'http://localhost:8000/api/auth/microsoft/callback';
    }

    /**
     * Verificar si la integración está configurada
     */
    public function isConfigured(): bool
    {
        return !empty($this->clientId) && !empty($this->clientSecret);
    }

    /**
     * Generar URL para autorización OAuth 2.0
     */
    public function getAuthorizationUrl(string $state = null): string
    {
        $params = [
            'client_id' => $this->clientId,
            'response_type' => 'code',
            'redirect_uri' => $this->redirectUri,
            'response_mode' => 'query',
            'scope' => 'openid profile email offline_access Calendars.ReadWrite User.Read',
            'state' => $state ?? bin2hex(random_bytes(16))
        ];

        return "{$this->authUrl}/{$this->tenantId}/oauth2/v2.0/authorize?" . http_build_query($params);
    }

    /**
     * Intercambiar código de autorización por tokens
     */
    public function getTokenFromCode(string $code): ?array
    {
        $tokenUrl = "{$this->authUrl}/{$this->tenantId}/oauth2/v2.0/token";

        $params = [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'code' => $code,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
            'scope' => 'openid profile email offline_access Calendars.ReadWrite User.Read'
        ];

        $response = $this->makePostRequest($tokenUrl, $params);

        if (isset($response['access_token'])) {
            return [
                'access_token' => $response['access_token'],
                'refresh_token' => $response['refresh_token'] ?? null,
                'expires_in' => $response['expires_in'] ?? 3600,
                'token_type' => $response['token_type'] ?? 'Bearer'
            ];
        }

        return null;
    }

    /**
     * Refrescar token de acceso
     */
    public function refreshToken(string $refreshToken): ?array
    {
        $tokenUrl = "{$this->authUrl}/{$this->tenantId}/oauth2/v2.0/token";

        $params = [
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token',
            'scope' => 'openid profile email offline_access Calendars.ReadWrite User.Read'
        ];

        $response = $this->makePostRequest($tokenUrl, $params);

        if (isset($response['access_token'])) {
            return [
                'access_token' => $response['access_token'],
                'refresh_token' => $response['refresh_token'] ?? $refreshToken,
                'expires_in' => $response['expires_in'] ?? 3600
            ];
        }

        return null;
    }

    /**
     * Obtener información del usuario de Microsoft
     */
    public function getUserInfo(string $accessToken): ?array
    {
        $response = $this->makeGraphRequest('GET', '/me', $accessToken);
        return $response;
    }

    /**
     * Crear evento en el calendario de Outlook
     */
    public function createCalendarEvent(string $accessToken, array $eventData): ?array
    {
        $event = [
            'subject' => $eventData['titulo'] ?? 'Cita Médica - Vitalia',
            'body' => [
                'contentType' => 'HTML',
                'content' => $this->buildEventBody($eventData)
            ],
            'start' => [
                'dateTime' => $eventData['fecha_inicio'],
                'timeZone' => 'America/Mexico_City'
            ],
            'end' => [
                'dateTime' => $eventData['fecha_fin'],
                'timeZone' => 'America/Mexico_City'
            ],
            'location' => [
                'displayName' => $eventData['ubicacion'] ?? 'Centro de Rehabilitación Vitalia'
            ],
            'attendees' => [],
            'isOnlineMeeting' => $eventData['es_virtual'] ?? false,
            'onlineMeetingProvider' => $eventData['es_virtual'] ? 'teamsForBusiness' : null,
            'reminderMinutesBeforeStart' => $eventData['recordatorio_minutos'] ?? 60
        ];

        // Agregar asistentes si existen
        if (!empty($eventData['asistentes'])) {
            foreach ($eventData['asistentes'] as $asistente) {
                $event['attendees'][] = [
                    'emailAddress' => [
                        'address' => $asistente['email'],
                        'name' => $asistente['nombre'] ?? $asistente['email']
                    ],
                    'type' => 'required'
                ];
            }
        }

        $response = $this->makeGraphRequest('POST', '/me/events', $accessToken, $event);

        if (isset($response['id'])) {
            return [
                'success' => true,
                'event_id' => $response['id'],
                'web_link' => $response['webLink'] ?? null,
                'online_meeting' => $response['onlineMeeting'] ?? null
            ];
        }

        return null;
    }

    /**
     * Obtener eventos del calendario
     */
    public function getCalendarEvents(string $accessToken, string $startDate, string $endDate): ?array
    {
        $params = http_build_query([
            'startDateTime' => $startDate,
            'endDateTime' => $endDate,
            '$orderby' => 'start/dateTime',
            '$top' => 50
        ]);

        $response = $this->makeGraphRequest('GET', "/me/calendarView?{$params}", $accessToken);

        if (isset($response['value'])) {
            return array_map(function ($event) {
                return [
                    'id' => $event['id'],
                    'titulo' => $event['subject'],
                    'inicio' => $event['start']['dateTime'],
                    'fin' => $event['end']['dateTime'],
                    'ubicacion' => $event['location']['displayName'] ?? null,
                    'es_virtual' => $event['isOnlineMeeting'] ?? false,
                    'link_reunion' => $event['onlineMeeting']['joinUrl'] ?? null,
                    'estado' => $this->mapResponseStatus($event['responseStatus']['response'] ?? 'none')
                ];
            }, $response['value']);
        }

        return null;
    }

    /**
     * Obtener disponibilidad (horarios libres/ocupados)
     */
    public function getScheduleAvailability(string $accessToken, array $emails, string $startDate, string $endDate): ?array
    {
        $requestBody = [
            'schedules' => $emails,
            'startTime' => [
                'dateTime' => $startDate,
                'timeZone' => 'America/Mexico_City'
            ],
            'endTime' => [
                'dateTime' => $endDate,
                'timeZone' => 'America/Mexico_City'
            ],
            'availabilityViewInterval' => 30 // intervalos de 30 minutos
        ];

        $response = $this->makeGraphRequest('POST', '/me/calendar/getSchedule', $accessToken, $requestBody);

        if (isset($response['value'])) {
            return $response['value'];
        }

        return null;
    }

    /**
     * Actualizar evento existente
     */
    public function updateCalendarEvent(string $accessToken, string $eventId, array $eventData): ?array
    {
        $event = [];

        if (isset($eventData['titulo'])) {
            $event['subject'] = $eventData['titulo'];
        }
        if (isset($eventData['fecha_inicio'])) {
            $event['start'] = [
                'dateTime' => $eventData['fecha_inicio'],
                'timeZone' => 'America/Mexico_City'
            ];
        }
        if (isset($eventData['fecha_fin'])) {
            $event['end'] = [
                'dateTime' => $eventData['fecha_fin'],
                'timeZone' => 'America/Mexico_City'
            ];
        }
        if (isset($eventData['ubicacion'])) {
            $event['location'] = ['displayName' => $eventData['ubicacion']];
        }

        $response = $this->makeGraphRequest('PATCH', "/me/events/{$eventId}", $accessToken, $event);

        return isset($response['id']) ? ['success' => true, 'event_id' => $response['id']] : null;
    }

    /**
     * Eliminar/Cancelar evento
     */
    public function deleteCalendarEvent(string $accessToken, string $eventId): bool
    {
        $response = $this->makeGraphRequest('DELETE', "/me/events/{$eventId}", $accessToken);
        return $response === null || empty($response); // DELETE exitoso retorna vacío
    }

    /**
     * Construir cuerpo HTML del evento
     */
    private function buildEventBody(array $eventData): string
    {
        $html = '<div style="font-family: Arial, sans-serif;">';
        $html .= '<h2 style="color: #10b981;">Cita Médica - Vitalia</h2>';

        if (!empty($eventData['tipo_cita'])) {
            $html .= '<p><strong>Tipo de cita:</strong> ' . htmlspecialchars($eventData['tipo_cita']) . '</p>';
        }
        if (!empty($eventData['especialista'])) {
            $html .= '<p><strong>Especialista:</strong> ' . htmlspecialchars($eventData['especialista']) . '</p>';
        }
        if (!empty($eventData['paciente'])) {
            $html .= '<p><strong>Paciente:</strong> ' . htmlspecialchars($eventData['paciente']) . '</p>';
        }
        if (!empty($eventData['notas'])) {
            $html .= '<p><strong>Notas:</strong> ' . htmlspecialchars($eventData['notas']) . '</p>';
        }

        $html .= '<hr style="border: 1px solid #e5e7eb;">';
        $html .= '<p style="color: #6b7280; font-size: 12px;">Este evento fue creado automáticamente por Vitalia - Sistema de Rehabilitación</p>';
        $html .= '</div>';

        return $html;
    }

    /**
     * Mapear estado de respuesta
     */
    private function mapResponseStatus(string $status): string
    {
        $map = [
            'none' => 'pendiente',
            'organizer' => 'organizador',
            'tentativelyAccepted' => 'tentativo',
            'accepted' => 'aceptada',
            'declined' => 'rechazada',
            'notResponded' => 'sin_respuesta'
        ];
        return $map[$status] ?? 'desconocido';
    }

    /**
     * Realizar petición POST
     */
    private function makePostRequest(string $url, array $params): ?array
    {
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($params),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded'
            ],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return null;
        }

        return json_decode($response, true);
    }

    /**
     * Realizar petición a Graph API
     */
    private function makeGraphRequest(string $method, string $endpoint, string $accessToken, array $body = null): ?array
    {
        $url = $this->graphApiUrl . $endpoint;
        $ch = curl_init();

        $headers = [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ];

        $options = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_TIMEOUT => 30
        ];

        switch ($method) {
            case 'POST':
                $options[CURLOPT_POST] = true;
                if ($body) {
                    $options[CURLOPT_POSTFIELDS] = json_encode($body);
                }
                break;
            case 'PATCH':
                $options[CURLOPT_CUSTOMREQUEST] = 'PATCH';
                if ($body) {
                    $options[CURLOPT_POSTFIELDS] = json_encode($body);
                }
                break;
            case 'DELETE':
                $options[CURLOPT_CUSTOMREQUEST] = 'DELETE';
                break;
        }

        curl_setopt_array($ch, $options);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return ['error' => $error];
        }

        // DELETE exitoso retorna 204 sin contenido
        if ($httpCode === 204) {
            return null;
        }

        $decoded = json_decode($response, true);

        if ($httpCode >= 400) {
            return ['error' => $decoded['error']['message'] ?? 'Error desconocido', 'code' => $httpCode];
        }

        return $decoded;
    }
}
