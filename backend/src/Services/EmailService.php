<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/**
 * Servicio de Email con PHPMailer SMTP
 * Soporta Gmail, Outlook, SMTP genérico
 */
class EmailService
{
    private $config;
    private $smtpEnabled;

    public function __construct()
    {
        $this->config = [
            'from' => [
                'address' => getenv('MAIL_FROM') ?: getenv('MAIL_USERNAME') ?: 'noreply@vitalia.app',
                'name' => getenv('MAIL_FROM_NAME') ?: 'Azaria - UIOP'
            ],
            'support' => [
                'email' => 'unidadinvestigacionoyp_enesj@unam.mx',
                'phone' => '+52 1 442 436 9592'
            ],
            'smtp' => [
                'host' => getenv('MAIL_HOST') ?: 'smtp.gmail.com',
                'port' => (int)(getenv('MAIL_PORT') ?: 587),
                'username' => getenv('MAIL_USERNAME') ?: '',
                'password' => getenv('MAIL_PASSWORD') ?: '',
            ]
        ];

        // SMTP habilitado solo si hay credenciales configuradas
        $this->smtpEnabled = !empty($this->config['smtp']['username']) && !empty($this->config['smtp']['password']);
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
        $paciente = $cita['paciente_nombre'] ?? 'Paciente';
        $especialista = $cita['especialista_nombre'] ?? $cita['especialista'] ?? 'Especialista';
        $fecha = $this->formatearFecha($cita['fecha'] ?? '');
        $hora = $cita['hora_inicio'] ?? $cita['hora'] ?? '';
        $tipo = $cita['tipo_cita_nombre'] ?? $cita['especialidad'] ?? 'Consulta';
        $email = $cita['paciente_email'] ?? null;

        if (!$email) {
            $this->log("Confirmacion de cita - sin email de paciente", $cita);
            return true;
        }

        $subject = "Cita confirmada - $tipo";
        $body = $this->getCitaTemplate('confirmacion', [
            'paciente' => $paciente,
            'especialista' => $especialista,
            'fecha' => $fecha,
            'hora' => $hora,
            'tipo' => $tipo,
            'motivo' => $cita['motivo'] ?? ''
        ]);

        return $this->send($email, $subject, $body);
    }

    public function sendCitaCancelacion($cita)
    {
        $paciente = $cita['paciente_nombre'] ?? 'Paciente';
        $especialista = $cita['especialista_nombre'] ?? 'Especialista';
        $fecha = $this->formatearFecha($cita['fecha'] ?? '');
        $hora = $cita['hora_inicio'] ?? '';
        $tipo = $cita['tipo_cita_nombre'] ?? 'Consulta';
        $email = $cita['paciente_email'] ?? null;

        if (!$email) {
            $this->log("Cancelacion de cita - sin email de paciente", $cita);
            return true;
        }

        $subject = "Cita cancelada - $tipo";
        $body = $this->getCitaTemplate('cancelacion', [
            'paciente' => $paciente,
            'especialista' => $especialista,
            'fecha' => $fecha,
            'hora' => $hora,
            'tipo' => $tipo,
            'motivo' => $cita['motivo_cancelacion'] ?? ''
        ]);

        return $this->send($email, $subject, $body);
    }

    public function sendCitaReagendada($cita, $newData)
    {
        $paciente = $cita['paciente_nombre'] ?? 'Paciente';
        $especialista = $cita['especialista_nombre'] ?? 'Especialista';
        $fechaAnterior = $this->formatearFecha($cita['fecha'] ?? '');
        $horaAnterior = $cita['hora_inicio'] ?? '';
        $fechaNueva = $this->formatearFecha($newData['nueva_fecha'] ?? '');
        $horaNueva = $newData['nueva_hora'] ?? '';
        $tipo = $cita['tipo_cita_nombre'] ?? 'Consulta';
        $email = $cita['paciente_email'] ?? null;

        if (!$email) {
            $this->log("Reagendamiento de cita - sin email de paciente", $cita);
            return true;
        }

        $subject = "Cita reagendada - $tipo";
        $body = $this->getCitaTemplate('reagendada', [
            'paciente' => $paciente,
            'especialista' => $especialista,
            'fecha_anterior' => $fechaAnterior,
            'hora_anterior' => $horaAnterior,
            'fecha_nueva' => $fechaNueva,
            'hora_nueva' => $horaNueva,
            'tipo' => $tipo
        ]);

        return $this->send($email, $subject, $body);
    }

    public function sendCitaRecordatorio($cita)
    {
        $paciente = $cita['paciente_nombre'] ?? 'Paciente';
        $especialista = $cita['especialista_nombre'] ?? 'Especialista';
        $fecha = $this->formatearFecha($cita['fecha'] ?? '');
        $hora = $cita['hora_inicio'] ?? '';
        $tipo = $cita['tipo_cita_nombre'] ?? 'Consulta';
        $email = $cita['paciente_email'] ?? null;

        if (!$email) {
            $this->log("Recordatorio de cita - sin email de paciente", $cita);
            return true;
        }

        $subject = "Recordatorio: Cita manana - $tipo";
        $body = $this->getCitaTemplate('recordatorio', [
            'paciente' => $paciente,
            'especialista' => $especialista,
            'fecha' => $fecha,
            'hora' => $hora,
            'tipo' => $tipo,
            'ubicacion' => $cita['ubicacion'] ?? ''
        ]);

        return $this->send($email, $subject, $body);
    }

    /**
     * Enviar email via SMTP (PHPMailer)
     */
    private function send($to, $subject, $body)
    {
        // Si SMTP no está configurado, solo loguear
        if (!$this->smtpEnabled) {
            $this->log("Email a: $to | Asunto: $subject (SMTP no configurado, solo log)", ['body_preview' => substr(strip_tags($body), 0, 200)]);
            return true;
        }

        $mail = new PHPMailer(true);

        try {
            // Configuración SMTP
            $mail->isSMTP();
            $mail->Host       = $this->config['smtp']['host'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $this->config['smtp']['username'];
            $mail->Password   = $this->config['smtp']['password'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = $this->config['smtp']['port'];
            $mail->CharSet    = 'UTF-8';

            // Remitente y destinatario
            $mail->setFrom($this->config['from']['address'], $this->config['from']['name']);
            $mail->addAddress($to);
            $mail->addReplyTo($this->config['support']['email'], $this->config['from']['name']);

            // Contenido
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $body));

            $mail->send();
            $this->log("Email enviado exitosamente a: $to | Asunto: $subject");
            return true;

        } catch (Exception $e) {
            $this->log("Error enviando email a: $to | Error: " . $mail->ErrorInfo, ['subject' => $subject]);
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

    /**
     * Formatear fecha YYYY-MM-DD a formato legible
     */
    private function formatearFecha($fecha)
    {
        if (empty($fecha)) return '';
        try {
            $dt = new \DateTime($fecha);
            $meses = ['enero','febrero','marzo','abril','mayo','junio',
                       'julio','agosto','septiembre','octubre','noviembre','diciembre'];
            $dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
            return $dias[$dt->format('w')] . ' ' . $dt->format('j') . ' de ' . $meses[$dt->format('n')-1] . ' de ' . $dt->format('Y');
        } catch (\Exception $e) {
            return $fecha;
        }
    }

    /**
     * Template genérico para emails de citas
     */
    private function getCitaTemplate($tipo, $data)
    {
        $configs = [
            'confirmacion' => ['color' => '#00BFA5', 'icon' => '✅', 'title' => 'Cita Confirmada'],
            'cancelacion'  => ['color' => '#F44336', 'icon' => '❌', 'title' => 'Cita Cancelada'],
            'reagendada'   => ['color' => '#FF9800', 'icon' => '🔄', 'title' => 'Cita Reagendada'],
            'recordatorio' => ['color' => '#2196F3', 'icon' => '🔔', 'title' => 'Recordatorio de Cita'],
        ];

        $cfg = $configs[$tipo] ?? $configs['confirmacion'];
        $supportEmail = $this->config['support']['email'] ?? 'soporte@vitalia.app';

        // Contenido específico por tipo
        $contenido = '';
        switch ($tipo) {
            case 'confirmacion':
                $contenido = "
                    <p>Tu cita ha sido <strong>confirmada</strong> con los siguientes datos:</p>
                    <div class='details'>
                        <p>📋 <strong>Tipo:</strong> {$data['tipo']}</p>
                        <p>👨‍⚕️ <strong>Especialista:</strong> {$data['especialista']}</p>
                        <p>📅 <strong>Fecha:</strong> {$data['fecha']}</p>
                        <p>🕐 <strong>Hora:</strong> {$data['hora']}</p>
                    </div>
                    <p style='margin-top:15px;'>Recuerda llegar 10 minutos antes de tu cita.</p>";
                break;

            case 'cancelacion':
                $contenido = "
                    <p>Tu cita ha sido <strong>cancelada</strong>:</p>
                    <div class='details'>
                        <p>📋 <strong>Tipo:</strong> {$data['tipo']}</p>
                        <p>👨‍⚕️ <strong>Especialista:</strong> {$data['especialista']}</p>
                        <p>📅 <strong>Fecha:</strong> {$data['fecha']}</p>
                        <p>🕐 <strong>Hora:</strong> {$data['hora']}</p>
                    </div>"
                    . (!empty($data['motivo']) ? "<p><strong>Motivo:</strong> {$data['motivo']}</p>" : "")
                    . "<p style='margin-top:15px;'>Si necesitas agendar una nueva cita, puedes hacerlo desde la aplicación.</p>";
                break;

            case 'reagendada':
                $contenido = "
                    <p>Tu cita ha sido <strong>reagendada</strong>:</p>
                    <div class='details' style='background:#fff3cd;'>
                        <p><strong>Anterior:</strong></p>
                        <p>📅 {$data['fecha_anterior']} a las 🕐 {$data['hora_anterior']}</p>
                    </div>
                    <div class='details'>
                        <p><strong>Nueva fecha:</strong></p>
                        <p>📅 {$data['fecha_nueva']} a las 🕐 {$data['hora_nueva']}</p>
                    </div>
                    <p>👨‍⚕️ <strong>Especialista:</strong> {$data['especialista']}</p>";
                break;

            case 'recordatorio':
                $contenido = "
                    <p>Te recordamos que tienes una <strong>cita programada</strong> para mañana:</p>
                    <div class='details'>
                        <p>📋 <strong>Tipo:</strong> {$data['tipo']}</p>
                        <p>👨‍⚕️ <strong>Especialista:</strong> {$data['especialista']}</p>
                        <p>📅 <strong>Fecha:</strong> {$data['fecha']}</p>
                        <p>🕐 <strong>Hora:</strong> {$data['hora']}</p>
                    </div>"
                    . (!empty($data['ubicacion']) ? "<p>📍 <strong>Ubicación:</strong> {$data['ubicacion']}</p>" : "")
                    . "<p style='margin-top:15px;'><strong>Recuerda:</strong> Llega 10 minutos antes y trae tu identificación.</p>";
                break;
        }

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: {$cfg['color']}; color: white; padding: 24px; text-align: center; }
                .header h1 { margin: 0; font-size: 22px; }
                .content { padding: 24px; background: #f9f9f9; }
                .details { background: white; padding: 16px; border-radius: 8px; margin: 16px 0;
                           border-left: 4px solid {$cfg['color']}; }
                .details p { margin: 6px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666;
                          border-top: 1px solid #eee; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>{$cfg['icon']} {$cfg['title']}</h1>
                </div>
                <div class='content'>
                    <p>Hola <strong>{$data['paciente']}</strong>,</p>
                    $contenido
                </div>
                <div class='footer'>
                    <p>Vitalia - Sistema de Rehabilitación</p>
                    <p>📧 {$supportEmail}</p>
                </div>
            </div>
        </body>
        </html>";
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
