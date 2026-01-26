<?php

namespace App\Controllers;

use App\Models\Mensaje;
use App\Services\NotificationService;
use App\Utils\Response;
use App\Utils\Validator;

class ChatController
{
    private $notificationService;

    public function __construct()
    {
        $this->notificationService = new NotificationService();
    }

    // OBTENER CONVERSACIONES
    public function getConversaciones($userId, $rol)
    {
        $conversaciones = Mensaje::getConversaciones($userId, $rol);
        return Response::success($conversaciones);
    }

    // OBTENER MENSAJES DE UNA CONVERSACIÓN
    public function getMensajes($userId, $otherUserId)
    {
        $mensajes = Mensaje::getConversacion($userId, $otherUserId);

        // Marcar mensajes como leídos
        Mensaje::markAsRead($userId, $otherUserId);

        return Response::success($mensajes);
    }

    // ENVIAR MENSAJE
    public function enviarMensaje($data)
    {
        $validator = new Validator($data);
        $validator->required(['remitente_id', 'destinatario_id', 'contenido']);

        if (!$validator->passes()) {
            return Response::error($validator->errors(), 422);
        }

        $result = Mensaje::create($data);

        if ($result) {
            // Notificar al destinatario
            $this->notificationService->sendNotification([
                'user_id' => $data['destinatario_id'],
                'tipo' => NOTIF_MENSAJE,
                'titulo' => 'Nuevo mensaje',
                'mensaje' => 'Tienes un nuevo mensaje'
            ]);

            return Response::success($result, 'Mensaje enviado', 201);
        }

        return Response::error('Error al enviar mensaje', 500);
    }

    // ELIMINAR MENSAJES VIEJOS (>24h)
    public function limpiarMensajesViejos()
    {
        $result = Mensaje::deleteOldMessages();
        return Response::success(['deleted' => $result], 'Mensajes antiguos eliminados');
    }

    // CONTAR MENSAJES NO LEÍDOS
    public function contarNoLeidos($userId)
    {
        $count = Mensaje::countUnread($userId);
        return Response::success(['count' => $count]);
    }

    // BUSCAR USUARIOS PARA CHAT
    public function buscarUsuarios($userId, $rol, $busqueda = '')
    {
        $usuarios = Mensaje::searchUsers($userId, $rol, $busqueda);
        return Response::success($usuarios);
    }
}
