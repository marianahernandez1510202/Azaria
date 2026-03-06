<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Utils\Response;

class ExpedienteController
{
    private $db;
    private $uploadDir;
    private $allowedExtensions = ['pdf', 'docx', 'doc'];
    private $maxFileSize = 10485760; // 10MB

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
        $this->uploadDir = __DIR__ . '/../../uploads/expediente/';
    }

    /**
     * Resumen del expediente: ultima glucosa, presion, animo, comida, citas del dia
     */
    public function getResumen($pacienteId)
    {
        try {
            $pdo = $this->db->getConnection();

            // Info del paciente
            $stmt = $pdo->prepare("
                SELECT u.nombre_completo, u.fecha_nacimiento, u.email,
                       p.fase_actual_id, p.progreso_general,
                       ft.nombre as fase_nombre
                FROM pacientes p
                JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN fases_tratamiento ft ON p.fase_actual_id = ft.id
                WHERE p.id = ?
            ");
            $stmt->execute([$pacienteId]);
            $paciente = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$paciente) {
                return Response::error('Paciente no encontrado', 404);
            }

            // Ultima glucosa
            $glucosa = null;
            try {
                $stmt = $pdo->prepare("SELECT valor, fecha, hora, momento_id FROM bitacora_glucosa WHERE paciente_id = ? ORDER BY fecha DESC, hora DESC LIMIT 1");
                $stmt->execute([$pacienteId]);
                $glucosa = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Ultima presion
            $presion = null;
            try {
                $stmt = $pdo->prepare("SELECT sistolica, diastolica, pulso, fecha, hora FROM bitacora_presion WHERE paciente_id = ? ORDER BY fecha DESC, hora DESC LIMIT 1");
                $stmt->execute([$pacienteId]);
                $presion = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Ultimo estado de animo (tabla real: registro_animo + emociones)
            $animo = null;
            try {
                $stmt = $pdo->prepare("
                    SELECT ra.nivel_animo as nivel, ra.notas, ra.fecha, ra.created_at,
                           GROUP_CONCAT(e.nombre SEPARATOR ', ') as emocion
                    FROM registro_animo ra
                    LEFT JOIN registro_animo_emociones rae ON ra.id = rae.registro_animo_id
                    LEFT JOIN emociones e ON rae.emocion_id = e.id
                    WHERE ra.paciente_id = ?
                    GROUP BY ra.id
                    ORDER BY ra.created_at DESC LIMIT 1
                ");
                $stmt->execute([$pacienteId]);
                $animo = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Ultima comida
            $comida = null;
            try {
                $stmt = $pdo->prepare("
                    SELECT rc.descripcion, rc.fecha, rc.hora, rc.foto_url,
                           tc.nombre as tipo_comida
                    FROM registro_comidas rc
                    LEFT JOIN tipos_comida tc ON rc.tipo_comida_id = tc.id
                    WHERE rc.paciente_id = ?
                    ORDER BY rc.fecha DESC, rc.hora DESC
                    LIMIT 1
                ");
                $stmt->execute([$pacienteId]);
                $comida = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Citas del dia
            $citasHoy = [];
            try {
                $stmt = $pdo->prepare("
                    SELECT c.id, c.fecha, c.hora, c.estado,
                           tc.nombre as tipo_cita,
                           u.nombre_completo as especialista_nombre
                    FROM citas c
                    LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
                    LEFT JOIN usuarios u ON c.especialista_id = u.id
                    WHERE c.paciente_id = ? AND c.fecha = CURDATE()
                      AND c.estado IN ('programada', 'confirmada')
                    ORDER BY c.hora ASC
                ");
                $stmt->execute([$pacienteId]);
                $citasHoy = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            // Conteo de archivos
            $archivosCount = 0;
            try {
                $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM archivos_expediente WHERE paciente_id = ?");
                $stmt->execute([$pacienteId]);
                $archivosCount = $stmt->fetch(\PDO::FETCH_ASSOC)['total'];
            } catch (\Exception $e) {}

            // Ultimo peso / IMC
            $peso = null;
            try {
                $stmt = $pdo->prepare("
                    SELECT peso, talla, imc, fecha_medicion
                    FROM mediciones_antropometricas
                    WHERE paciente_id = ?
                    ORDER BY fecha_medicion DESC
                    LIMIT 1
                ");
                $stmt->execute([$pacienteId]);
                $peso = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            return Response::success([
                'paciente' => $paciente,
                'glucosa' => $glucosa ?: null,
                'presion' => $presion ?: null,
                'animo' => $animo ?: null,
                'comida' => $comida ?: null,
                'peso' => $peso ?: null,
                'citas_hoy' => $citasHoy,
                'archivos_count' => (int)$archivosCount
            ]);

        } catch (\Exception $e) {
            return Response::error('Error obteniendo resumen: ' . $e->getMessage());
        }
    }

    /**
     * Subir archivo al expediente
     */
    public function subirArchivo($data)
    {
        try {
            if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
                return Response::error('No se recibió un archivo válido', 400);
            }

            $file = $_FILES['archivo'];
            $pacienteId = $data['paciente_id'] ?? null;
            $descripcion = $data['descripcion'] ?? '';
            $categoria = $data['categoria'] ?? 'analisis';
            $fechaEstudio = $data['fecha_estudio'] ?? date('Y-m-d');

            if (!$pacienteId) {
                return Response::error('Se requiere paciente_id', 400);
            }

            // Validar extension
            $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($extension, $this->allowedExtensions)) {
                return Response::error('Tipo de archivo no permitido. Solo PDF, DOCX y DOC.', 400);
            }

            // Validar tamaño
            if ($file['size'] > $this->maxFileSize) {
                return Response::error('El archivo excede el tamaño máximo de 10MB', 400);
            }

            // Crear directorio si no existe
            $targetDir = $this->uploadDir . $pacienteId . '/';
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            // Generar nombre unico
            $nombreArchivo = 'exp_' . $pacienteId . '_' . time() . '_' . uniqid() . '.' . $extension;
            $targetPath = $targetDir . $nombreArchivo;

            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                return Response::error('Error al guardar el archivo', 500);
            }

            // Obtener usuario actual
            $currentUser = $GLOBALS['current_user'] ?? null;
            $subidoPor = $currentUser['id'] ?? $currentUser['usuario_id'] ?? 0;

            // Insertar en DB
            $pdo = $this->db->getConnection();
            $stmt = $pdo->prepare("
                INSERT INTO archivos_expediente
                (paciente_id, subido_por, nombre_original, nombre_archivo, tipo_archivo, tamano, categoria, descripcion, fecha_estudio)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $pacienteId,
                $subidoPor,
                $file['name'],
                $nombreArchivo,
                $extension,
                $file['size'],
                $categoria,
                $descripcion,
                $fechaEstudio
            ]);

            $archivoId = $pdo->lastInsertId();

            return Response::success([
                'id' => $archivoId,
                'nombre_original' => $file['name'],
                'tipo_archivo' => $extension,
                'tamano' => $file['size'],
                'categoria' => $categoria
            ], 'Archivo subido correctamente');

        } catch (\Exception $e) {
            return Response::error('Error subiendo archivo: ' . $e->getMessage());
        }
    }

    /**
     * Listar archivos del expediente
     */
    public function getArchivos($pacienteId)
    {
        try {
            $pdo = $this->db->getConnection();
            $stmt = $pdo->prepare("
                SELECT ae.*, u.nombre_completo as subido_por_nombre
                FROM archivos_expediente ae
                LEFT JOIN usuarios u ON ae.subido_por = u.id
                WHERE ae.paciente_id = ?
                ORDER BY ae.created_at DESC
            ");
            $stmt->execute([$pacienteId]);
            $archivos = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            return Response::success($archivos);

        } catch (\Exception $e) {
            return Response::error('Error obteniendo archivos: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar archivo
     */
    public function eliminarArchivo($archivoId)
    {
        try {
            $pdo = $this->db->getConnection();
            $currentUser = $GLOBALS['current_user'] ?? null;
            $userId = $currentUser['id'] ?? $currentUser['usuario_id'] ?? 0;

            // Obtener archivo
            $stmt = $pdo->prepare("SELECT * FROM archivos_expediente WHERE id = ?");
            $stmt->execute([$archivoId]);
            $archivo = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$archivo) {
                return Response::error('Archivo no encontrado', 404);
            }

            // Eliminar archivo fisico
            $filePath = $this->uploadDir . $archivo['paciente_id'] . '/' . $archivo['nombre_archivo'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Eliminar de DB
            $stmt = $pdo->prepare("DELETE FROM archivos_expediente WHERE id = ?");
            $stmt->execute([$archivoId]);

            return Response::success(null, 'Archivo eliminado');

        } catch (\Exception $e) {
            return Response::error('Error eliminando archivo: ' . $e->getMessage());
        }
    }

    /**
     * Descargar archivo
     */
    public function descargarArchivo($archivoId)
    {
        try {
            $pdo = $this->db->getConnection();
            $stmt = $pdo->prepare("SELECT * FROM archivos_expediente WHERE id = ?");
            $stmt->execute([$archivoId]);
            $archivo = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$archivo) {
                return Response::error('Archivo no encontrado', 404);
            }

            $filePath = $this->uploadDir . $archivo['paciente_id'] . '/' . $archivo['nombre_archivo'];
            if (!file_exists($filePath)) {
                return Response::error('Archivo no encontrado en el servidor', 404);
            }

            $mimeTypes = [
                'pdf' => 'application/pdf',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'doc' => 'application/msword'
            ];

            $mime = $mimeTypes[$archivo['tipo_archivo']] ?? 'application/octet-stream';

            header('Content-Type: ' . $mime);
            header('Content-Disposition: attachment; filename="' . $archivo['nombre_original'] . '"');
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: no-cache');

            readfile($filePath);
            exit;

        } catch (\Exception $e) {
            return Response::error('Error descargando archivo: ' . $e->getMessage());
        }
    }

    /**
     * Generar link para compartir expediente
     */
    public function compartirExpediente($pacienteId)
    {
        try {
            $pdo = $this->db->getConnection();

            $token = bin2hex(random_bytes(32));
            $expiraEn = date('Y-m-d H:i:s', strtotime('+72 hours'));

            $stmt = $pdo->prepare("
                INSERT INTO expediente_compartido (paciente_id, token, expira_en)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$pacienteId, $token, $expiraEn]);

            return Response::success([
                'token' => $token,
                'expira_en' => $expiraEn
            ], 'Link de compartir generado');

        } catch (\Exception $e) {
            return Response::error('Error generando link: ' . $e->getMessage());
        }
    }

    /**
     * Ver expediente compartido (publico, sin auth)
     */
    public function getExpedienteCompartido($token)
    {
        try {
            $pdo = $this->db->getConnection();

            // Validar token
            $stmt = $pdo->prepare("
                SELECT * FROM expediente_compartido
                WHERE token = ? AND expira_en > NOW()
            ");
            $stmt->execute([$token]);
            $compartido = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$compartido) {
                return Response::error('El enlace ha expirado o no es válido', 404);
            }

            $pacienteId = $compartido['paciente_id'];

            // Info del paciente (sin email por privacidad)
            $stmt = $pdo->prepare("
                SELECT u.nombre_completo, u.fecha_nacimiento,
                       p.fase_actual_id, p.progreso_general,
                       ft.nombre as fase_nombre
                FROM pacientes p
                JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN fases_tratamiento ft ON p.fase_actual_id = ft.id
                WHERE p.id = ?
            ");
            $stmt->execute([$pacienteId]);
            $paciente = $stmt->fetch(\PDO::FETCH_ASSOC);

            // Ultima glucosa
            $glucosa = null;
            try {
                $stmt = $pdo->prepare("SELECT valor, fecha FROM bitacora_glucosa WHERE paciente_id = ? ORDER BY fecha DESC LIMIT 1");
                $stmt->execute([$pacienteId]);
                $glucosa = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Ultima presion
            $presion = null;
            try {
                $stmt = $pdo->prepare("SELECT sistolica, diastolica, pulso, fecha FROM bitacora_presion WHERE paciente_id = ? ORDER BY fecha DESC LIMIT 1");
                $stmt->execute([$pacienteId]);
                $presion = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Ultimo animo (tabla real: registro_animo + emociones)
            $animo = null;
            try {
                $stmt = $pdo->prepare("
                    SELECT ra.nivel_animo as nivel, ra.notas, ra.fecha, ra.created_at,
                           GROUP_CONCAT(e.nombre SEPARATOR ', ') as emocion
                    FROM registro_animo ra
                    LEFT JOIN registro_animo_emociones rae ON ra.id = rae.registro_animo_id
                    LEFT JOIN emociones e ON rae.emocion_id = e.id
                    WHERE ra.paciente_id = ?
                    GROUP BY ra.id
                    ORDER BY ra.created_at DESC LIMIT 1
                ");
                $stmt->execute([$pacienteId]);
                $animo = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Ultimo dolor
            $dolor = null;
            try {
                $stmt = $pdo->prepare("SELECT intensidad, fecha, hora FROM bitacora_dolor WHERE paciente_id = ? ORDER BY fecha DESC, hora DESC LIMIT 1");
                $stmt->execute([$pacienteId]);
                $dolor = $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
            } catch (\Exception $e) {}

            // Medicamentos activos
            $medicamentos = [];
            try {
                $stmt = $pdo->prepare("
                    SELECT nombre_comercial, nombre_generico, dosis, frecuencia, via_administracion, fecha_inicio, fecha_fin
                    FROM medicamentos_paciente
                    WHERE paciente_id = ? AND activo = 1
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$pacienteId]);
                $medicamentos = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            // Archivos
            $archivos = [];
            try {
                $stmt = $pdo->prepare("
                    SELECT id, nombre_original, tipo_archivo, tamano, categoria, descripcion, fecha_estudio, created_at
                    FROM archivos_expediente WHERE paciente_id = ? ORDER BY created_at DESC
                ");
                $stmt->execute([$pacienteId]);
                $archivos = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            } catch (\Exception $e) {}

            return Response::success([
                'paciente' => $paciente,
                'glucosa' => $glucosa ?: null,
                'presion' => $presion ?: null,
                'animo' => $animo ?: null,
                'dolor' => $dolor,
                'medicamentos' => $medicamentos,
                'archivos' => $archivos,
                'expira_en' => $compartido['expira_en']
            ]);

        } catch (\Exception $e) {
            return Response::error('Error obteniendo expediente: ' . $e->getMessage());
        }
    }
}
