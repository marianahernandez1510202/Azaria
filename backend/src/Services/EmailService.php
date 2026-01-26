<?php

namespace App\Services;

/**
 * Servicio de Email simplificado
 * En desarrollo: solo loguea los emails
 * En producción: usa mail() nativo de PHP o se puede integrar con SMTP
 */
class EmailService
{
    private $config;
    private $enabled;

    public function __construct()
    {
        // Cargar configuración si existe
        $configPath = __DIR__ . '/../../config/email.php';
        if (file_exists($configPath)) {
            $this->config = require $configPath;
        } else {
            $this->config = [
                'from' => [
                    'address' => getenv('MAIL_FROM') ?: 'noreply@vitalia.app',
                    'name' => 'Vitalia Sistema'
                ],
                'support' => [
                    'email' => 'soporte@vitalia.app',
                    'phone' => '+52 442 123 4567'
                ]
            ];
        }

        // En desarrollo, solo loguear
        $this->enabled = getenv('APP_ENV') === 'production';
    }

    public function sendWelcomeEmail($user, $credentials)
    {
        $subject = 'Bienvenido a Vitalia';
        $body = $this->getWelcomeTemplate($user, $credentials);

        return $this->send($user['email'], $subject, $body);
    }

    public function sendRecoveryCode($email, $code)
    {
        $subject = 'Código de recuperación - Vitalia';
        $body = $this->getRecoveryTemplate($code);

        return $this->send($email, $subject, $body);
    }

    public function sendCitaConfirmacion($cita)
    {
        // TODO: Implementar en producción
        $this->log("Confirmación de cita enviada", $cita);
        return true;
    }

    public function sendCitaCancelacion($cita)
    {
        // TODO: Implementar en producción
        $this->log("Cancelación de cita enviada", $cita);
        return true;
    }

    public function sendCitaReagendada($cita, $newData)
    {
        // TODO: Implementar en producción
        $this->log("Reagendamiento de cita enviado", ['cita' => $cita, 'newData' => $newData]);
        return true;
    }

    public function sendCitaRecordatorio($cita)
    {
        // TODO: Implementar en producción
        $this->log("Recordatorio de cita enviado", $cita);
        return true;
    }

    /**
     * Enviar email
     */
    private function send($to, $subject, $body)
    {
        // En desarrollo, solo loguear
        if (!$this->enabled) {
            $this->log("Email a: $to | Asunto: $subject", ['body_preview' => substr(strip_tags($body), 0, 200)]);
            return true;
        }

        // En producción, usar mail() nativo
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . $this->config['from']['name'] . ' <' . $this->config['from']['address'] . '>',
            'Reply-To: ' . $this->config['support']['email'],
            'X-Mailer: PHP/' . phpversion()
        ];

        try {
            $result = mail($to, $subject, $body, implode("\r\n", $headers));

            if (!$result) {
                $this->log("Error enviando email a: $to", ['subject' => $subject]);
            }

            return $result;
        } catch (\Exception $e) {
            $this->log("Excepción enviando email: " . $e->getMessage(), ['to' => $to]);
            return false;
        }
    }

    /**
     * Loguear emails (para desarrollo)
     */
    private function log($message, $data = [])
    {
        $logMessage = "[EMAIL] $message";
        if (!empty($data)) {
            $logMessage .= " | Data: " . json_encode($data, JSON_UNESCAPED_UNICODE);
        }
        error_log($logMessage);
    }

    private function getWelcomeTemplate($user, $credentials)
    {
        $supportEmail = $this->config['support']['email'] ?? 'soporte@vitalia.app';
        $supportPhone = $this->config['support']['phone'] ?? '+52 442 123 4567';

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .credentials { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>¡Bienvenido a Vitalia!</h1>
                </div>
                <div class='content'>
                    <p>Hola <strong>{$user['nombre_completo']}</strong>,</p>
                    <p>Tu cuenta ha sido creada exitosamente en el Sistema Vitalia.</p>

                    <div class='credentials'>
                        <h3>Tus credenciales de acceso:</h3>
                        <p><strong>Email:</strong> {$credentials['email']}</p>
                        <p><strong>Contraseña temporal:</strong> {$credentials['password']}</p>
                    </div>

                    <p><strong>Importante:</strong> Por seguridad, te recomendamos:</p>
                    <ul>
                        <li>Iniciar sesión lo antes posible</li>
                        <li>Configurar tu PIN de 6 dígitos para acceso rápido</li>
                        <li>Cambiar tu contraseña temporal</li>
                    </ul>
                </div>
                <div class='footer'>
                    <p>¿Necesitas ayuda? Contáctanos:</p>
                    <p>📧 {$supportEmail} | 📞 {$supportPhone}</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    private function getRecoveryTemplate($code)
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .code { font-size: 32px; text-align: center; color: #2196F3;
                        background: white; padding: 20px; border-radius: 5px;
                        letter-spacing: 5px; font-weight: bold; }
                .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Código de Recuperación</h1>
                </div>
                <div class='content'>
                    <p>Has solicitado recuperar tu contraseña o PIN.</p>
                    <p>Tu código de verificación es:</p>

                    <div class='code'>{$code}</div>

                    <div class='warning'>
                        <p>⏰ <strong>Este código expira en 15 minutos.</strong></p>
                        <p>⚠️ Si no solicitaste este código, ignora este email.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
