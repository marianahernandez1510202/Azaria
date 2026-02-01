<?php

namespace App\Controllers;

use App\Services\DatabaseService;
use App\Utils\Response;
use App\Utils\Validator;

class OrtesisController
{
    private $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    // =====================================================
    // NIVELES K
    // =====================================================

    /**
     * Obtener todos los niveles K
     */
    public function getNivelesK()
    {
        try {
            $niveles = $this->db->query(
                "SELECT * FROM niveles_k ORDER BY nivel"
            )->fetchAll();

            // Decodificar JSON
            foreach ($niveles as &$nivel) {
                $nivel['caracteristicas'] = json_decode($nivel['caracteristicas'], true);
                $nivel['actividades_permitidas'] = json_decode($nivel['actividades_permitidas'], true);
                $nivel['tipo_protesis_recomendada'] = json_decode($nivel['tipo_protesis_recomendada'], true);
            }

            return Response::success($niveles);
        } catch (\Exception $e) {
            error_log('Error getting niveles K: ' . $e->getMessage());
            return Response::error('Error al obtener niveles K', 500);
        }
    }

    /**
     * Obtener un nivel K específico
     */
    public function getNivelK($nivel)
    {
        try {
            $nivelData = $this->db->query(
                "SELECT * FROM niveles_k WHERE nivel = ?",
                [$nivel]
            )->fetch();

            if (!$nivelData) {
                return Response::error('Nivel K no encontrado', 404);
            }

            $nivelData['caracteristicas'] = json_decode($nivelData['caracteristicas'], true);
            $nivelData['actividades_permitidas'] = json_decode($nivelData['actividades_permitidas'], true);
            $nivelData['tipo_protesis_recomendada'] = json_decode($nivelData['tipo_protesis_recomendada'], true);

            return Response::success($nivelData);
        } catch (\Exception $e) {
            error_log('Error getting nivel K: ' . $e->getMessage());
            return Response::error('Error al obtener nivel K', 500);
        }
    }

    // =====================================================
    // TIPOS DE PRÓTESIS
    // =====================================================

    /**
     * Obtener todos los tipos de prótesis (usa tabla existente tipos_dispositivo)
     */
    public function getTiposProtesis($categoria = null)
    {
        try {
            $sql = "SELECT * FROM tipos_dispositivo WHERE categoria = 'protesis'";
            $params = [];

            $sql .= " ORDER BY nombre";

            $tipos = $this->db->query($sql, $params)->fetchAll();

            // Decodificar JSON si existen los campos
            foreach ($tipos as &$tipo) {
                if (isset($tipo['componentes'])) {
                    $tipo['componentes'] = json_decode($tipo['componentes'], true);
                }
                if (isset($tipo['ventajas'])) {
                    $tipo['ventajas'] = json_decode($tipo['ventajas'], true);
                }
                if (isset($tipo['desventajas'])) {
                    $tipo['desventajas'] = json_decode($tipo['desventajas'], true);
                }
                if (isset($tipo['cuidados_especificos'])) {
                    $tipo['cuidados_especificos'] = json_decode($tipo['cuidados_especificos'], true);
                }
            }

            return Response::success($tipos);
        } catch (\Exception $e) {
            error_log('Error getting tipos protesis: ' . $e->getMessage());
            return Response::error('Error al obtener tipos de prótesis', 500);
        }
    }

    /**
     * Obtener un tipo de prótesis específico (usa tabla existente tipos_dispositivo)
     */
    public function getTipoProtesis($id)
    {
        try {
            $tipo = $this->db->query(
                "SELECT * FROM tipos_dispositivo WHERE id = ? AND categoria = 'protesis'",
                [$id]
            )->fetch();

            if (!$tipo) {
                return Response::error('Tipo de prótesis no encontrado', 404);
            }

            if (isset($tipo['componentes'])) {
                $tipo['componentes'] = json_decode($tipo['componentes'], true);
            }
            if (isset($tipo['ventajas'])) {
                $tipo['ventajas'] = json_decode($tipo['ventajas'], true);
            }
            if (isset($tipo['desventajas'])) {
                $tipo['desventajas'] = json_decode($tipo['desventajas'], true);
            }
            if (isset($tipo['cuidados_especificos'])) {
                $tipo['cuidados_especificos'] = json_decode($tipo['cuidados_especificos'], true);
            }

            return Response::success($tipo);
        } catch (\Exception $e) {
            error_log('Error getting tipo protesis: ' . $e->getMessage());
            return Response::error('Error al obtener tipo de prótesis', 500);
        }
    }

    /**
     * Obtener categorías de prótesis disponibles
     */
    public function getCategoriasProtesis()
    {
        $categorias = [
            ['id' => 'transtibial', 'nombre' => 'Transtibial (Debajo de rodilla)', 'descripcion' => 'Amputaciones por debajo de la rodilla'],
            ['id' => 'transfemoral', 'nombre' => 'Transfemoral (Arriba de rodilla)', 'descripcion' => 'Amputaciones por encima de la rodilla'],
            ['id' => 'desarticulacion_rodilla', 'nombre' => 'Desarticulación de Rodilla', 'descripcion' => 'Amputación a nivel de la articulación de rodilla'],
            ['id' => 'desarticulacion_cadera', 'nombre' => 'Desarticulación de Cadera', 'descripcion' => 'Amputación a nivel de la cadera'],
            ['id' => 'parcial_pie', 'nombre' => 'Pie Parcial', 'descripcion' => 'Amputaciones parciales del pie'],
            ['id' => 'miembro_superior', 'nombre' => 'Miembro Superior', 'descripcion' => 'Prótesis de brazo y mano']
        ];

        return Response::success($categorias);
    }

    // =====================================================
    // GUÍAS DE CUIDADO
    // =====================================================

    /**
     * Obtener todas las guías de cuidado (usa tabla existente guias_cuidado)
     */
    public function getGuias($categoria = null)
    {
        try {
            $sql = "SELECT * FROM guias_cuidado WHERE 1=1";
            $params = [];

            if ($categoria) {
                $sql .= " AND categoria = ?";
                $params[] = $categoria;
            }

            $sql .= " ORDER BY orden, titulo";

            $guias = $this->db->query($sql, $params)->fetchAll();

            // Decodificar JSON si existen los campos
            foreach ($guias as &$guia) {
                if (isset($guia['pasos'])) {
                    $guia['pasos'] = json_decode($guia['pasos'], true);
                }
                if (isset($guia['tips'])) {
                    $guia['tips'] = json_decode($guia['tips'], true);
                }
                if (isset($guia['advertencias'])) {
                    $guia['advertencias'] = json_decode($guia['advertencias'], true);
                }
                if (isset($guia['nivel_k_aplicable'])) {
                    $guia['nivel_k_aplicable'] = json_decode($guia['nivel_k_aplicable'], true);
                }
            }

            return Response::success($guias);
        } catch (\Exception $e) {
            error_log('Error getting guias: ' . $e->getMessage());
            return Response::error('Error al obtener guías', 500);
        }
    }

    /**
     * Obtener una guía específica (usa tabla existente guias_cuidado)
     */
    public function getGuia($id)
    {
        try {
            $guia = $this->db->query(
                "SELECT * FROM guias_cuidado WHERE id = ?",
                [$id]
            )->fetch();

            if (!$guia) {
                return Response::error('Guía no encontrada', 404);
            }

            if (isset($guia['pasos'])) {
                $guia['pasos'] = json_decode($guia['pasos'], true);
            }
            if (isset($guia['tips'])) {
                $guia['tips'] = json_decode($guia['tips'], true);
            }
            if (isset($guia['advertencias'])) {
                $guia['advertencias'] = json_decode($guia['advertencias'], true);
            }
            if (isset($guia['nivel_k_aplicable'])) {
                $guia['nivel_k_aplicable'] = json_decode($guia['nivel_k_aplicable'], true);
            }

            return Response::success($guia);
        } catch (\Exception $e) {
            error_log('Error getting guia: ' . $e->getMessage());
            return Response::error('Error al obtener guía', 500);
        }
    }

    /**
     * Obtener categorías de guías disponibles
     */
    public function getCategoriasGuias()
    {
        $categorias = [
            ['id' => 'cuidado_munon', 'nombre' => 'Cuidado del Muñón', 'icon' => '🦵'],
            ['id' => 'limpieza_protesis', 'nombre' => 'Limpieza de Prótesis', 'icon' => '🧼'],
            ['id' => 'colocacion', 'nombre' => 'Colocación', 'icon' => '👟'],
            ['id' => 'uso_diario', 'nombre' => 'Uso Diario', 'icon' => '📅'],
            ['id' => 'mantenimiento', 'nombre' => 'Mantenimiento', 'icon' => '🔧'],
            ['id' => 'emergencias', 'nombre' => 'Emergencias y Alertas', 'icon' => '⚠️'],
            ['id' => 'ejercicios', 'nombre' => 'Ejercicios', 'icon' => '💪'],
            ['id' => 'general', 'nombre' => 'General', 'icon' => '📚']
        ];

        return Response::success($categorias);
    }

    // =====================================================
    // PREGUNTAS FRECUENTES
    // =====================================================

    /**
     * Obtener todas las FAQs de prótesis
     */
    public function getFAQs($categoria = null)
    {
        try {
            $sql = "SELECT * FROM faq_protesis WHERE activo = 1";
            $params = [];

            if ($categoria) {
                $sql .= " AND categoria = ?";
                $params[] = $categoria;
            }

            $sql .= " ORDER BY orden, pregunta";

            $faqs = $this->db->query($sql, $params)->fetchAll();

            return Response::success($faqs);
        } catch (\Exception $e) {
            error_log('Error getting FAQs: ' . $e->getMessage());
            return Response::error('Error al obtener preguntas frecuentes', 500);
        }
    }

    // =====================================================
    // VIDEOS EDUCATIVOS
    // =====================================================

    /**
     * Obtener todos los videos educativos
     */
    public function getVideos($categoria = null)
    {
        try {
            $sql = "SELECT * FROM videos_educativos_protesis WHERE activo = 1";
            $params = [];

            if ($categoria) {
                $sql .= " AND categoria = ?";
                $params[] = $categoria;
            }

            $sql .= " ORDER BY orden, titulo";

            $videos = $this->db->query($sql, $params)->fetchAll();

            foreach ($videos as &$video) {
                $video['nivel_k_aplicable'] = json_decode($video['nivel_k_aplicable'], true);
            }

            return Response::success($videos);
        } catch (\Exception $e) {
            error_log('Error getting videos: ' . $e->getMessage());
            return Response::error('Error al obtener videos', 500);
        }
    }

    // =====================================================
    // INFORMACIÓN DEL DISPOSITIVO DEL PACIENTE
    // =====================================================

    /**
     * Obtener información del dispositivo de un paciente (usa tablas existentes)
     */
    public function getDispositivo($pacienteId)
    {
        try {
            $dispositivo = $this->db->query(
                "SELECT dp.*, td.nombre as tipo_protesis_nombre, td.categoria, td.cuidados_especificos,
                        nk.nombre as nivel_k_nombre, nk.descripcion as nivel_k_descripcion
                 FROM dispositivos_paciente dp
                 LEFT JOIN tipos_dispositivo td ON dp.tipo_dispositivo_id = td.id
                 LEFT JOIN niveles_k nk ON dp.nivel_k = nk.nivel
                 WHERE dp.paciente_id = ?",
                [$pacienteId]
            )->fetch();

            if (!$dispositivo) {
                // Retornar datos por defecto si no tiene dispositivo registrado
                return Response::success([
                    'tiene_dispositivo' => false,
                    'mensaje' => 'No hay dispositivo registrado. Tu especialista registrará tu prótesis.'
                ]);
            }

            if (!empty($dispositivo['cuidados_especificos'])) {
                $dispositivo['cuidados_especificos'] = json_decode($dispositivo['cuidados_especificos'], true);
            }
            if (!empty($dispositivo['componentes_actuales'])) {
                $dispositivo['componentes_actuales'] = json_decode($dispositivo['componentes_actuales'], true);
            }

            $dispositivo['tiene_dispositivo'] = true;

            return Response::success($dispositivo);
        } catch (\Exception $e) {
            error_log('Error getting dispositivo: ' . $e->getMessage());
            return Response::error('Error al obtener información del dispositivo', 500);
        }
    }

    /**
     * Actualizar nivel K del paciente (solo especialista)
     */
    public function actualizarNivelK($pacienteId, $data)
    {
        try {
            $validator = new Validator($data);
            $validator->required(['nivel_k'])->in('nivel_k', ['K0', 'K1', 'K2', 'K3', 'K4']);

            if (!$validator->passes()) {
                return Response::error($validator->errors(), 422);
            }

            $this->db->query(
                "UPDATE dispositivos_paciente
                 SET nivel_k = ?, fecha_evaluacion_k = CURDATE(), updated_at = NOW()
                 WHERE paciente_id = ?",
                [$data['nivel_k'], $pacienteId]
            );

            return Response::success(null, 'Nivel K actualizado exitosamente');
        } catch (\Exception $e) {
            error_log('Error updating nivel K: ' . $e->getMessage());
            return Response::error('Error al actualizar nivel K', 500);
        }
    }

    // =====================================================
    // HISTORIAL DE AJUSTES
    // =====================================================

    public function getAjustes($pacienteId)
    {
        try {
            $ajustes = $this->db->query(
                "SELECT ao.*, u.nombre_completo as especialista_nombre
                 FROM ajustes_ortesis ao
                 LEFT JOIN usuarios u ON ao.realizado_por = u.id
                 WHERE ao.paciente_id = ?
                 ORDER BY ao.created_at DESC",
                [$pacienteId]
            )->fetchAll();

            return Response::success($ajustes);
        } catch (\Exception $e) {
            error_log('Error getting ajustes: ' . $e->getMessage());
            return Response::error('Error al obtener ajustes', 500);
        }
    }

    // =====================================================
    // REPORTAR PROBLEMAS
    // =====================================================

    public function getProblemas($pacienteId)
    {
        try {
            $problemas = $this->db->query(
                "SELECT * FROM problemas_ortesis
                 WHERE paciente_id = ?
                 ORDER BY created_at DESC",
                [$pacienteId]
            )->fetchAll();

            return Response::success($problemas);
        } catch (\Exception $e) {
            error_log('Error getting problemas: ' . $e->getMessage());
            return Response::error('Error al obtener problemas', 500);
        }
    }

    public function reportarProblema($data)
    {
        try {
            $validator = new Validator($data);
            $validator->required(['paciente_id', 'tipo', 'descripcion']);

            if (!$validator->passes()) {
                return Response::error($validator->errors(), 422);
            }

            $this->db->query(
                "INSERT INTO problemas_ortesis (paciente_id, tipo, descripcion, urgencia, estado, created_at)
                 VALUES (?, ?, ?, ?, 'pendiente', NOW())",
                [
                    $data['paciente_id'],
                    $data['tipo'],
                    $data['descripcion'],
                    $data['urgencia'] ?? 'media'
                ]
            );

            $id = $this->db->lastInsertId();

            return Response::success(['id' => $id], 'Problema reportado exitosamente', 201);
        } catch (\Exception $e) {
            error_log('Error reporting problema: ' . $e->getMessage());
            return Response::error('Error al reportar problema', 500);
        }
    }

    // =====================================================
    // CONTENIDO EDUCATIVO COMPLETO
    // =====================================================

    /**
     * Obtener todo el contenido educativo organizado (usa tablas existentes adaptadas)
     */
    public function getContenidoEducativo()
    {
        try {
            // Niveles K (tabla nueva)
            $nivelesK = $this->db->query("SELECT * FROM niveles_k ORDER BY nivel")->fetchAll();
            foreach ($nivelesK as &$nivel) {
                $nivel['caracteristicas'] = json_decode($nivel['caracteristicas'], true);
                $nivel['actividades_permitidas'] = json_decode($nivel['actividades_permitidas'], true);
                $nivel['tipo_protesis_recomendada'] = json_decode($nivel['tipo_protesis_recomendada'], true);
            }

            // Tipos de prótesis (usa tabla existente tipos_dispositivo)
            $tiposProtesis = $this->db->query(
                "SELECT * FROM tipos_dispositivo WHERE categoria = 'protesis' ORDER BY nombre"
            )->fetchAll();

            $tiposList = [];
            foreach ($tiposProtesis as $tipo) {
                if (isset($tipo['componentes'])) {
                    $tipo['componentes'] = json_decode($tipo['componentes'], true);
                }
                if (isset($tipo['ventajas'])) {
                    $tipo['ventajas'] = json_decode($tipo['ventajas'], true);
                }
                if (isset($tipo['desventajas'])) {
                    $tipo['desventajas'] = json_decode($tipo['desventajas'], true);
                }
                if (isset($tipo['cuidados_especificos'])) {
                    $tipo['cuidados_especificos'] = json_decode($tipo['cuidados_especificos'], true);
                }
                $tiposList[] = $tipo;
            }

            // Guías de cuidado (usa tabla existente guias_cuidado)
            $guias = $this->db->query(
                "SELECT * FROM guias_cuidado ORDER BY orden, titulo"
            )->fetchAll();

            $guiasPorCategoria = [];
            foreach ($guias as $guia) {
                if (isset($guia['pasos'])) {
                    $guia['pasos'] = json_decode($guia['pasos'], true);
                }
                if (isset($guia['tips'])) {
                    $guia['tips'] = json_decode($guia['tips'], true);
                }
                if (isset($guia['advertencias'])) {
                    $guia['advertencias'] = json_decode($guia['advertencias'], true);
                }
                if (isset($guia['nivel_k_aplicable'])) {
                    $guia['nivel_k_aplicable'] = json_decode($guia['nivel_k_aplicable'], true);
                }
                $cat = $guia['categoria'] ?? 'general';
                $guiasPorCategoria[$cat][] = $guia;
            }

            // FAQs (tabla nueva)
            $faqs = $this->db->query(
                "SELECT * FROM faq_protesis WHERE activo = 1 ORDER BY orden"
            )->fetchAll();

            // Videos (tabla nueva)
            $videos = $this->db->query(
                "SELECT * FROM videos_educativos_protesis WHERE activo = 1 ORDER BY orden"
            )->fetchAll();
            foreach ($videos as &$video) {
                $video['nivel_k_aplicable'] = json_decode($video['nivel_k_aplicable'], true);
            }

            return Response::success([
                'niveles_k' => $nivelesK,
                'tipos_protesis' => $tiposList,
                'guias_cuidado' => $guiasPorCategoria,
                'faqs' => $faqs,
                'videos' => $videos
            ]);
        } catch (\Exception $e) {
            error_log('Error getting contenido educativo: ' . $e->getMessage());
            return Response::error('Error al obtener contenido educativo', 500);
        }
    }
}
