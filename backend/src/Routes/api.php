<?php

use App\Controllers\AuthController;
use App\Controllers\PerfilController;
use App\Controllers\FaseController;
use App\Controllers\NutricionController;
use App\Controllers\MedicinaController;
use App\Controllers\FisioterapiaController;
use App\Controllers\NeuropsicologiaController;
use App\Controllers\OrtesisController;
use App\Controllers\CitasController;
use App\Controllers\ChatController;
use App\Controllers\RecordatoriosController;
use App\Controllers\FAQController;
use App\Controllers\BlogController;
use App\Controllers\ComunidadController;
use App\Controllers\DashboardController;
use App\Controllers\AdminController;
use App\Controllers\EspecialistaController;
use App\Controllers\MensajesController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

// Función helper para rutas
function route($method, $path, $callback, $middleware = []) {
    global $requestMethod, $requestUri;

    if ($requestMethod === $method && preg_match("#^$path$#", $requestUri, $matches)) {
        // Aplicar middleware
        foreach ($middleware as $mw) {
            if ($mw === 'auth') {
                $auth = new AuthMiddleware();
                $auth->handle();
            }
        }

        // Ejecutar callback
        array_shift($matches); // Remover match completo
        call_user_func_array($callback, $matches);
        exit;
    }
}

// RUTAS PÚBLICAS

// Ruta de prueba para verificar conexión a base de datos
route('GET', '/api/test/db', function() {
    // Mostrar configuración actual (sin contraseña)
    $config = [
        'DB_HOST' => $_ENV['DB_HOST'] ?? 'no definido',
        'DB_PORT' => $_ENV['DB_PORT'] ?? 'no definido',
        'DB_NAME' => $_ENV['DB_NAME'] ?? 'no definido',
        'DB_USER' => $_ENV['DB_USER'] ?? 'no definido',
    ];

    try {
        $dsn = "mysql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']};charset=utf8mb4";
        $pdo = new \PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASSWORD'], [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION
        ]);
        $result = $pdo->query("SELECT COUNT(*) as total FROM niveles_k")->fetch();
        \App\Utils\Response::success([
            'status' => 'connected',
            'config' => $config,
            'niveles_k_count' => $result['total'] ?? 0
        ]);
    } catch (\PDOException $e) {
        \App\Utils\Response::error('Error PDO: ' . $e->getMessage() . ' | Config: ' . json_encode($config), 500);
    } catch (\Exception $e) {
        \App\Utils\Response::error('Error: ' . $e->getMessage() . ' | Config: ' . json_encode($config), 500);
    }
});

// Ruta pública para obtener tipos de prótesis (sin auth para testing)
route('GET', '/api/test/tipos-protesis', function() {
    try {
        $db = \App\Services\DatabaseService::getInstance();
        $tipos = $db->query("SELECT * FROM tipos_dispositivo WHERE categoria = 'protesis'")->fetchAll();
        \App\Utils\Response::success($tipos);
    } catch (\Exception $e) {
        \App\Utils\Response::error('Error: ' . $e->getMessage(), 500);
    }
});

// Ruta pública para contenido educativo (sin auth para testing)
route('GET', '/api/test/educativo', function() {
    try {
        $db = \App\Services\DatabaseService::getInstance();

        // Verificar qué tablas existen
        $tablas = [];

        // Niveles K
        try {
            $nivelesK = $db->query("SELECT * FROM niveles_k ORDER BY nivel")->fetchAll();
            $tablas['niveles_k'] = count($nivelesK) . ' registros';
        } catch (\Exception $e) {
            $tablas['niveles_k'] = 'ERROR: ' . $e->getMessage();
        }

        // Tipos dispositivo
        try {
            $tipos = $db->query("SELECT * FROM tipos_dispositivo WHERE categoria = 'protesis'")->fetchAll();
            $tablas['tipos_dispositivo'] = count($tipos) . ' registros';
        } catch (\Exception $e) {
            $tablas['tipos_dispositivo'] = 'ERROR: ' . $e->getMessage();
        }

        // Guias cuidado
        try {
            $guias = $db->query("SELECT * FROM guias_cuidado")->fetchAll();
            $tablas['guias_cuidado'] = count($guias) . ' registros';
        } catch (\Exception $e) {
            $tablas['guias_cuidado'] = 'ERROR: ' . $e->getMessage();
        }

        // FAQs
        try {
            $faqs = $db->query("SELECT * FROM faq_protesis")->fetchAll();
            $tablas['faq_protesis'] = count($faqs) . ' registros';
        } catch (\Exception $e) {
            $tablas['faq_protesis'] = 'ERROR: ' . $e->getMessage();
        }

        // Videos
        try {
            $videos = $db->query("SELECT * FROM videos_educativos_protesis")->fetchAll();
            $tablas['videos_educativos_protesis'] = count($videos) . ' registros';
        } catch (\Exception $e) {
            $tablas['videos_educativos_protesis'] = 'ERROR: ' . $e->getMessage();
        }

        \App\Utils\Response::success($tablas);
    } catch (\Exception $e) {
        \App\Utils\Response::error('Error general: ' . $e->getMessage(), 500);
    }
});

// TEST: Dispositivo del paciente (sin auth para debugging)
route('GET', '/api/test/dispositivo/(\d+)', function($pacienteId) {
    try {
        $db = \App\Services\DatabaseService::getInstance();
        $dispositivo = $db->query(
            "SELECT dp.*, td.nombre as tipo_protesis_nombre, td.categoria, td.cuidados_especificos,
                    nk.nombre as nivel_k_nombre, nk.descripcion as nivel_k_descripcion
             FROM dispositivos_paciente dp
             LEFT JOIN tipos_dispositivo td ON dp.tipo_dispositivo_id = td.id
             LEFT JOIN niveles_k nk ON dp.nivel_k = nk.nivel
             WHERE dp.paciente_id = ?",
            [$pacienteId]
        )->fetch();

        if (!$dispositivo) {
            \App\Utils\Response::success([
                'tiene_dispositivo' => false,
                'mensaje' => 'No hay dispositivo registrado'
            ]);
        } else {
            $dispositivo['tiene_dispositivo'] = true;
            \App\Utils\Response::success($dispositivo);
        }
    } catch (\Exception $e) {
        \App\Utils\Response::error('Error: ' . $e->getMessage(), 500);
    }
});

route('POST', '/api/auth/login', function() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    // Debug log
    error_log("LOGIN REQUEST - Raw: " . substr($rawInput, 0, 500));
    error_log("LOGIN REQUEST - Parsed email: " . ($data['email'] ?? 'NULL'));
    error_log("LOGIN REQUEST - Parsed credential: " . (isset($data['credential']) ? 'SET' : 'NOT SET'));

    $controller = new AuthController();
    $controller->login($data);
});

route('POST', '/api/auth/forgot-password', function() {
    $controller = new AuthController();
    $controller->forgotPassword(json_decode(file_get_contents('php://input'), true));
});

route('POST', '/api/auth/verify-code', function() {
    $controller = new AuthController();
    $controller->verifyRecoveryCode(json_decode(file_get_contents('php://input'), true));
});

route('POST', '/api/auth/reset-password', function() {
    $controller = new AuthController();
    $controller->resetPassword(json_decode(file_get_contents('php://input'), true));
});

// RUTAS PROTEGIDAS - AUTENTICACIÓN
route('POST', '/api/auth/logout', function() {
    $controller = new AuthController();
    $controller->logout();
}, ['auth']);

route('POST', '/api/auth/setup-pin', function() {
    $controller = new AuthController();
    $controller->setupPIN(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/auth/check-session', function() {
    $controller = new AuthController();
    $controller->checkSession();
}, ['auth']);

route('GET', '/api/auth/devices', function() {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new AuthController();
    $controller->getTrustedDevices($user['id']);
}, ['auth']);

// RUTAS DE DASHBOARD
route('GET', '/api/dashboard/resumen/(\d+)', function($userId) {
    $controller = new DashboardController();
    $controller->getResumen($userId);
}, ['auth']);

// RUTAS DE PERFIL
route('GET', '/api/perfil', function() {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new PerfilController();
    $controller->getPerfil($user['id']);
}, ['auth']);

route('PUT', '/api/perfil', function() {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new PerfilController();
    $controller->updatePerfil($user['id'], json_decode(file_get_contents('php://input'), true));
}, ['auth']);

// RUTA PARA OBTENER ESPECIALISTAS ASIGNADOS A UN PACIENTE
route('GET', '/api/pacientes/(\d+)/especialistas', function($pacienteId) {
    $controller = new PerfilController();
    $controller->getEspecialistasAsignados($pacienteId);
}, ['auth']);

// RUTAS DE FASES
route('GET', '/api/fases/actual/(\d+)', function($pacienteId) {
    $controller = new FaseController();
    $controller->getFaseActual($pacienteId);
}, ['auth']);

route('GET', '/api/fases/progreso/(\d+)', function($pacienteId) {
    $controller = new FaseController();
    $controller->getProgreso($pacienteId);
}, ['auth']);

// RUTAS DE NUTRICIÓN
route('GET', '/api/nutricion/recetas', function() {
    $controller = new NutricionController();
    $controller->getRecetas();
}, ['auth']);

route('GET', '/api/nutricion/historial/(\d+)', function($pacienteId) {
    $controller = new NutricionController();
    $controller->getHistorialComidas($pacienteId);
}, ['auth']);

route('POST', '/api/nutricion/comidas', function() {
    $controller = new NutricionController();
    $controller->registrarComida(array_merge($_POST, $_FILES));
}, ['auth']);

route('GET', '/api/nutricion/checklist/(\d+)/([0-9-]+)', function($pacienteId, $fecha) {
    $controller = new NutricionController();
    $controller->getChecklistDiario($pacienteId, $fecha);
}, ['auth']);

route('POST', '/api/nutricion/checklist', function() {
    $controller = new NutricionController();
    $controller->actualizarChecklist(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

// Nuevas rutas para módulo de nutrición mejorado
route('GET', '/api/nutricion/resumen/(\d+)/([0-9-]+)', function($pacienteId, $fecha) {
    $controller = new NutricionController();
    $controller->getResumenDia($pacienteId, $fecha);
}, ['auth']);

route('POST', '/api/nutricion/agua', function() {
    $controller = new NutricionController();
    $controller->registrarAgua(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/nutricion/agua/(\d+)/([0-9-]+)', function($pacienteId, $fecha) {
    $controller = new NutricionController();
    $controller->getRegistroAgua($pacienteId, $fecha);
}, ['auth']);

route('POST', '/api/nutricion/alimento', function() {
    $controller = new NutricionController();
    $controller->registrarAlimento(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/nutricion/alimentos/buscar', function() {
    $controller = new NutricionController();
    $controller->buscarAlimentos($_GET['q'] ?? '');
}, ['auth']);

// RUTAS DE MEDICINA
route('GET', '/api/medicina/glucosa/(\d+)', function($pacienteId) {
    $controller = new MedicinaController();
    $controller->getGlucosa($pacienteId);
}, ['auth']);

route('POST', '/api/medicina/glucosa', function() {
    $controller = new MedicinaController();
    $controller->registrarGlucosa(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/medicina/presion/(\d+)', function($pacienteId) {
    $controller = new MedicinaController();
    $controller->getPresion($pacienteId);
}, ['auth']);

route('POST', '/api/medicina/presion', function() {
    $controller = new MedicinaController();
    $controller->registrarPresion(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/medicina/dolor/(\d+)', function($pacienteId) {
    $controller = new MedicinaController();
    $controller->getDolor($pacienteId);
}, ['auth']);

route('POST', '/api/medicina/dolor', function() {
    $controller = new MedicinaController();
    $controller->registrarDolor(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/medicina/resumen/(\d+)', function($pacienteId) {
    $controller = new MedicinaController();
    $controller->getResumen($pacienteId);
}, ['auth']);

// RUTAS DE FISIOTERAPIA
route('GET', '/api/fisioterapia/videos', function() {
    $controller = new FisioterapiaController();
    $controller->getVideos();
}, ['auth']);

route('GET', '/api/fisioterapia/videos/(\d+)', function($id) {
    $controller = new FisioterapiaController();
    $controller->getVideo($id);
}, ['auth']);

route('GET', '/api/fisioterapia/rutina/(\d+)', function($pacienteId) {
    $controller = new FisioterapiaController();
    $controller->getVideosAsignados($pacienteId);
}, ['auth']);

route('GET', '/api/fisioterapia/progreso/(\d+)', function($pacienteId) {
    $controller = new FisioterapiaController();
    $controller->getHistorialChecklist($pacienteId);
}, ['auth']);

route('GET', '/api/fisioterapia/guias', function() {
    $controller = new FisioterapiaController();
    $controller->getGuias();
}, ['auth']);

route('GET', '/api/fisioterapia/checklist/(\d+)', function($pacienteId) {
    $controller = new FisioterapiaController();
    $controller->getChecklist($pacienteId);
}, ['auth']);

route('POST', '/api/fisioterapia/checklist', function() {
    $controller = new FisioterapiaController();
    $controller->guardarChecklist(array_merge($_POST, json_decode(file_get_contents('php://input'), true) ?? [], $_FILES));
}, ['auth']);

// RUTAS DE NEUROPSICOLOGÍA
route('GET', '/api/neuropsicologia/estados-animo/(\d+)', function($pacienteId) {
    $controller = new NeuropsicologiaController();
    $controller->getEstadosAnimo($pacienteId);
}, ['auth']);

route('POST', '/api/neuropsicologia/estados-animo', function() {
    $controller = new NeuropsicologiaController();
    $controller->registrarEstadoAnimo(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/neuropsicologia/ejercicios', function() {
    $controller = new NeuropsicologiaController();
    $controller->getEjercicios();
}, ['auth']);

route('GET', '/api/neuropsicologia/cuestionarios/(\d+)', function($pacienteId) {
    $controller = new NeuropsicologiaController();
    $controller->getCuestionarios($pacienteId);
}, ['auth']);

route('POST', '/api/neuropsicologia/cuestionarios', function() {
    $controller = new NeuropsicologiaController();
    $controller->guardarCuestionario(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

// ===== RUTAS DE PRÓTESIS Y ÓRTESIS =====

// Contenido educativo completo (niveles K, tipos, guías, FAQs)
route('GET', '/api/protesis/educativo', function() {
    $controller = new OrtesisController();
    $controller->getContenidoEducativo();
}, ['auth']);

// Niveles K
route('GET', '/api/protesis/niveles-k', function() {
    $controller = new OrtesisController();
    $controller->getNivelesK();
}, ['auth']);

route('GET', '/api/protesis/niveles-k/([A-Za-z0-9]+)', function($nivel) {
    $controller = new OrtesisController();
    $controller->getNivelK($nivel);
}, ['auth']);

// Tipos de Prótesis
route('GET', '/api/protesis/tipos', function() {
    $categoria = $_GET['categoria'] ?? null;
    $controller = new OrtesisController();
    $controller->getTiposProtesis($categoria);
}, ['auth']);

route('GET', '/api/protesis/tipos/(\d+)', function($id) {
    $controller = new OrtesisController();
    $controller->getTipoProtesis($id);
}, ['auth']);

route('GET', '/api/protesis/categorias', function() {
    $controller = new OrtesisController();
    $controller->getCategoriasProtesis();
}, ['auth']);

// Guías de Cuidado
route('GET', '/api/protesis/guias', function() {
    $categoria = $_GET['categoria'] ?? null;
    $controller = new OrtesisController();
    $controller->getGuias($categoria);
}, ['auth']);

route('GET', '/api/protesis/guias/(\d+)', function($id) {
    $controller = new OrtesisController();
    $controller->getGuia($id);
}, ['auth']);

route('GET', '/api/protesis/guias/categorias', function() {
    $controller = new OrtesisController();
    $controller->getCategoriasGuias();
}, ['auth']);

// FAQs de Prótesis
route('GET', '/api/protesis/faqs', function() {
    $categoria = $_GET['categoria'] ?? null;
    $controller = new OrtesisController();
    $controller->getFAQs($categoria);
}, ['auth']);

// Videos Educativos
route('GET', '/api/protesis/videos', function() {
    $categoria = $_GET['categoria'] ?? null;
    $controller = new OrtesisController();
    $controller->getVideos($categoria);
}, ['auth']);

// Dispositivo del paciente
route('GET', '/api/ortesis/dispositivo/(\d+)', function($pacienteId) {
    $controller = new OrtesisController();
    $controller->getDispositivo($pacienteId);
}, ['auth']);

route('PUT', '/api/ortesis/dispositivo/(\d+)/nivel-k', function($pacienteId) {
    $controller = new OrtesisController();
    $controller->actualizarNivelK($pacienteId, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

// Checklist de prótesis
route('GET', '/api/ortesis/checklist/(\d+)/([0-9-]+)', function($pacienteId, $fecha) {
    $controller = new FisioterapiaController();
    $controller->getChecklist($pacienteId, $fecha);
}, ['auth']);

// Problemas reportados
route('GET', '/api/ortesis/problemas/(\d+)', function($pacienteId) {
    $controller = new OrtesisController();
    $controller->getProblemas($pacienteId);
}, ['auth']);

route('POST', '/api/ortesis/problemas', function() {
    $controller = new OrtesisController();
    $controller->reportarProblema(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

// Ajustes realizados
route('GET', '/api/ortesis/ajustes/(\d+)', function($pacienteId) {
    $controller = new OrtesisController();
    $controller->getAjustes($pacienteId);
}, ['auth']);

// Mantener compatibilidad con rutas antiguas
route('GET', '/api/ortesis/guias', function() {
    $controller = new OrtesisController();
    $controller->getGuias();
}, ['auth']);

// RUTAS DE CITAS
route('GET', '/api/citas', function() {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new CitasController();
    $controller->getMisCitas($user['id'], $user['rol']);
}, ['auth']);

route('POST', '/api/citas', function() {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);
    error_log("=== POST /api/citas ===");
    error_log("Raw input: " . $rawInput);
    error_log("Parsed data: " . json_encode($data));
    $controller = new CitasController();
    $controller->agendarCita($data);
}, ['auth']);

// RUTAS DE CHAT
route('GET', '/api/chat/conversaciones', function() {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new ChatController();
    $controller->getConversaciones($user['id'], $user['rol']);
}, ['auth']);

route('POST', '/api/chat/mensajes', function() {
    $controller = new ChatController();
    $controller->enviarMensaje(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

// RUTAS DE RECORDATORIOS
route('GET', '/api/recordatorios/(\d+)', function($pacienteId) {
    $controller = new RecordatoriosController();
    $controller->getRecordatorios($pacienteId);
}, ['auth']);

route('POST', '/api/recordatorios', function() {
    $controller = new RecordatoriosController();
    $controller->crearRecordatorio(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('PUT', '/api/recordatorios/(\d+)', function($id) {
    $controller = new RecordatoriosController();
    $controller->actualizarRecordatorio($id, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('DELETE', '/api/recordatorios/(\d+)', function($id) {
    $controller = new RecordatoriosController();
    $controller->eliminarRecordatorio($id);
}, ['auth']);

// RUTAS DE FAQs
route('GET', '/api/faqs', function() {
    $controller = new FAQController();
    $controller->getFAQs();
}, ['auth']);

// RUTAS DE BLOG
route('GET', '/api/blog/articulos', function() {
    $controller = new BlogController();
    $controller->getArticulos();
}, ['auth']);

route('GET', '/api/blog/articulos/(\d+)', function($id) {
    $controller = new BlogController();
    $controller->getArticulo($id);
}, ['auth']);

route('POST', '/api/blog/articulos/(\d+)/like', function($id) {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new BlogController();
    $controller->toggleLike($id, $user['id']);
}, ['auth']);

route('GET', '/api/blog/articulos/(\d+)/comentarios', function($id) {
    $controller = new BlogController();
    $controller->getComentarios($id);
}, ['auth']);

route('POST', '/api/blog/articulos/(\d+)/comentarios', function($id) {
    $user = AuthMiddleware::getCurrentUser();
    $data = json_decode(file_get_contents('php://input'), true);
    $data['articulo_id'] = $id;
    $data['usuario_id'] = $user['id'];
    // Frontend envía 'texto', backend espera 'contenido'
    if (isset($data['texto']) && !isset($data['contenido'])) {
        $data['contenido'] = $data['texto'];
    }
    $controller = new BlogController();
    $controller->crearComentario($data);
}, ['auth']);

// RUTAS DE COMUNIDAD
route('GET', '/api/comunidad/feed', function() {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new ComunidadController();
    $controller->getFeed($user['id']);
}, ['auth']);

route('POST', '/api/comunidad/publicaciones', function() {
    $controller = new ComunidadController();
    $controller->crearPublicacion(array_merge($_POST, $_FILES));
}, ['auth']);

route('GET', '/api/comunidad/publicaciones/(\d+)', function($id) {
    $controller = new ComunidadController();
    $controller->getPublicacion($id);
}, ['auth']);

route('POST', '/api/comunidad/publicaciones/(\d+)/like', function($id) {
    $user = AuthMiddleware::getCurrentUser();
    $controller = new ComunidadController();
    $controller->reaccionar([
        'usuario_id' => $user['id'],
        'publicacion_id' => $id,
        'tipo_reaccion' => 'me_gusta'
    ]);
}, ['auth']);

route('GET', '/api/comunidad/publicaciones/(\d+)/comentarios', function($id) {
    $controller = new ComunidadController();
    $controller->getComentarios($id);
}, ['auth']);

route('POST', '/api/comunidad/publicaciones/(\d+)/comentarios', function($id) {
    $user = AuthMiddleware::getCurrentUser();
    $data = json_decode(file_get_contents('php://input'), true);
    $data['publicacion_id'] = $id;
    $data['usuario_id'] = $user['id'];
    // Frontend envía 'texto', backend espera 'contenido'
    if (isset($data['texto']) && !isset($data['contenido'])) {
        $data['contenido'] = $data['texto'];
    }
    $controller = new ComunidadController();
    $controller->crearComentario($data);
}, ['auth']);

route('POST', '/api/comunidad/reportar', function() {
    $user = AuthMiddleware::getCurrentUser();
    $data = json_decode(file_get_contents('php://input'), true);
    $data['usuario_id'] = $user['id'];
    $controller = new ComunidadController();
    $controller->reportarContenido($data);
}, ['auth']);

// ===== RUTAS DE ADMINISTRACIÓN =====
route('GET', '/api/admin/metricas', function() {
    $controller = new AdminController();
    $controller->getMetricas();
}, ['auth']);

route('GET', '/api/admin/usuarios', function() {
    $controller = new AdminController();
    $controller->getUsuarios();
}, ['auth']);

route('POST', '/api/admin/usuarios', function() {
    $controller = new AdminController();
    $controller->createUsuario(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('PUT', '/api/admin/usuarios/(\d+)', function($id) {
    $controller = new AdminController();
    $controller->updateUsuario($id, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('DELETE', '/api/admin/usuarios/(\d+)', function($id) {
    $controller = new AdminController();
    $controller->deleteUsuario($id);
}, ['auth']);

route('PUT', '/api/admin/usuarios/(\d+)/toggle', function($id) {
    $controller = new AdminController();
    $controller->toggleUsuarioActivo($id);
}, ['auth']);

route('GET', '/api/admin/especialistas', function() {
    $controller = new AdminController();
    $controller->getEspecialistas();
}, ['auth']);

route('PUT', '/api/admin/especialistas/(\d+)', function($id) {
    $controller = new AdminController();
    $controller->updateUsuario($id, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('DELETE', '/api/admin/especialistas/(\d+)', function($id) {
    $controller = new AdminController();
    $controller->deleteUsuario($id);
}, ['auth']);

route('GET', '/api/admin/blogs/metricas', function() {
    $controller = new AdminController();
    $controller->getBlogMetricas();
}, ['auth']);

route('GET', '/api/admin/faqs', function() {
    $controller = new AdminController();
    $controller->getFAQs();
}, ['auth']);

route('POST', '/api/admin/faqs', function() {
    $controller = new AdminController();
    $controller->createFAQ(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('PUT', '/api/admin/faqs/(\d+)', function($id) {
    $controller = new AdminController();
    $controller->updateFAQ($id, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('DELETE', '/api/admin/faqs/(\d+)', function($id) {
    $controller = new AdminController();
    $controller->deleteFAQ($id);
}, ['auth']);

// ===== RUTAS DE ESPECIALISTAS =====

// Lista de todos los especialistas activos
route('GET', '/api/especialistas', function() {
    try {
        $db = \App\Services\DatabaseService::getInstance();

        $especialistas = $db->query(
            "SELECT u.id, u.nombre_completo, u.email, u.avatar,
                    COALESCE(am.nombre, 'Medicina General') as area_medica
             FROM usuarios u
             LEFT JOIN areas_medicas am ON u.area_medica_id = am.id
             WHERE u.rol_id = 2 AND u.activo = 1
             ORDER BY u.nombre_completo"
        )->fetchAll();

        \App\Utils\Response::success($especialistas ?: []);
    } catch (\Exception $e) {
        error_log('Error getting especialistas: ' . $e->getMessage());
        \App\Utils\Response::error('Error al cargar especialistas', 500);
    }
}, ['auth']);

route('GET', '/api/especialistas/(\d+)/citas-hoy', function($id) {
    $controller = new EspecialistaController();
    $controller->getCitasHoy($id);
}, ['auth']);

route('GET', '/api/especialistas/(\d+)/pacientes', function($id) {
    $controller = new EspecialistaController();
    $controller->getPacientes($id);
}, ['auth']);

route('GET', '/api/especialistas/(\d+)/pacientes/(\d+)', function($especialistaId, $pacienteId) {
    $controller = new EspecialistaController();
    $controller->getPacienteDetalle($especialistaId, $pacienteId);
}, ['auth']);

route('PUT', '/api/especialistas/(\d+)/pacientes/(\d+)/seguimiento', function($especialistaId, $pacienteId) {
    $controller = new EspecialistaController();
    $controller->actualizarSeguimiento($especialistaId, $pacienteId, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('GET', '/api/especialistas/(\d+)/dashboard', function($id) {
    $controller = new EspecialistaController();
    $controller->getDashboardResumen($id);
}, ['auth']);

// ===== RUTAS DE MENSAJES =====
route('GET', '/api/mensajes/no-leidos/(\d+)', function($userId) {
    $controller = new MensajesController();
    $controller->getNoLeidos($userId);
}, ['auth']);

route('GET', '/api/mensajes/conversaciones/(\d+)', function($userId) {
    $controller = new MensajesController();
    $controller->getConversaciones($userId);
}, ['auth']);

route('GET', '/api/mensajes/conversacion/(\d+)/(\d+)', function($conversacionId, $userId) {
    $controller = new MensajesController();
    $controller->getMensajes($conversacionId, $userId);
}, ['auth']);

route('POST', '/api/mensajes/enviar', function() {
    $controller = new MensajesController();
    $controller->enviarMensaje(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('POST', '/api/mensajes/iniciar/(\d+)/(\d+)', function($userId, $otroUsuarioId) {
    $controller = new MensajesController();
    $controller->iniciarConversacion($userId, $otroUsuarioId);
}, ['auth']);

// ===== RUTAS DE CITAS PARA ESPECIALISTA =====
route('GET', '/api/citas/tipos', function() {
    $controller = new CitasController();
    $controller->getTiposCita();
}, ['auth']);

route('GET', '/api/citas/horarios/(\d+)/([0-9-]+)', function($especialistaId, $fecha) {
    $controller = new CitasController();
    $controller->getHorariosDisponibles($especialistaId, $fecha);
}, ['auth']);

route('GET', '/api/citas/especialista/(\d+)', function($especialistaId) {
    $controller = new CitasController();
    $controller->getCitasEspecialistaFecha($especialistaId, $_GET['fecha'] ?? null);
}, ['auth']);

route('POST', '/api/citas/especialista', function() {
    $controller = new CitasController();
    $controller->crearCitaEspecialista(json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('PUT', '/api/citas/(\d+)/estado', function($citaId) {
    $controller = new CitasController();
    $controller->actualizarEstadoCita($citaId, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('PUT', '/api/citas/(\d+)/notas', function($citaId) {
    $controller = new CitasController();
    $controller->agregarNotasCita($citaId, json_decode(file_get_contents('php://input'), true));
}, ['auth']);

route('PUT', '/api/citas/(\d+)/cancelar', function($citaId) {
    error_log("=== PUT /api/citas/{$citaId}/cancelar ===");
    $controller = new CitasController();
    $controller->cancelarCita($citaId, ['motivo_cancelacion' => 'Cancelada por usuario']);
}, ['auth']);

// ===== RUTAS DE INTEGRACIÓN CON OUTLOOK =====
use App\Controllers\OutlookCalendarController;

// Verificar estado de configuración de Microsoft
route('GET', '/api/outlook/status', function() {
    $controller = new OutlookCalendarController();
    $controller->checkStatus();
}, ['auth']);

// Verificar si el usuario tiene Outlook conectado
route('GET', '/api/outlook/connected', function() {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $controller = new OutlookCalendarController();
    $controller->isConnected($user['id']);
}, ['auth']);

// Iniciar flujo de autorización OAuth con Microsoft
route('GET', '/api/outlook/auth', function() {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $controller = new OutlookCalendarController();
    $controller->startAuth($user['id']);
}, ['auth']);

// Callback de autorización OAuth (sin auth porque viene de Microsoft)
route('GET', '/api/auth/microsoft/callback', function() {
    $controller = new OutlookCalendarController();
    $controller->handleCallback();
});

// Desconectar cuenta de Outlook
route('DELETE', '/api/outlook/disconnect', function() {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $controller = new OutlookCalendarController();
    $controller->disconnect($user['id']);
}, ['auth']);

// Sincronizar cita con Outlook
route('POST', '/api/outlook/sync/(\d+)', function($citaId) {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $controller = new OutlookCalendarController();
    $controller->syncCitaToOutlook($user['id'], $citaId);
}, ['auth']);

// Obtener eventos de Outlook
route('GET', '/api/outlook/events', function() {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $startDate = $_GET['start'] ?? date('Y-m-d\T00:00:00');
    $endDate = $_GET['end'] ?? date('Y-m-d\T23:59:59', strtotime('+30 days'));
    $controller = new OutlookCalendarController();
    $controller->getOutlookEvents($user['id'], $startDate, $endDate);
}, ['auth']);

// Obtener disponibilidad de calendario
route('POST', '/api/outlook/availability', function() {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $data = json_decode(file_get_contents('php://input'), true);
    $controller = new OutlookCalendarController();
    $controller->getAvailability($user['id'], $data);
}, ['auth']);

// Actualizar evento en Outlook
route('PUT', '/api/outlook/sync/(\d+)', function($citaId) {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $controller = new OutlookCalendarController();
    $controller->updateOutlookEvent($user['id'], $citaId);
}, ['auth']);

// Eliminar evento de Outlook
route('DELETE', '/api/outlook/sync/(\d+)', function($citaId) {
    $user = \App\Middleware\AuthMiddleware::getCurrentUser();
    $controller = new OutlookCalendarController();
    $controller->deleteOutlookEvent($user['id'], $citaId);
}, ['auth']);

// ===== RUTAS DE ESTUDIOS CLÍNICOS =====
route('POST', '/api/estudios', function() {
    $data = json_decode(file_get_contents('php://input'), true);
    $db = \App\Services\DatabaseService::getInstance();

    $db->query(
        "INSERT INTO estudios_clinicos (paciente_id, especialista_id, nombre, tipo, fecha, resultado, observaciones, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [
            $data['paciente_id'],
            $data['especialista_id'],
            $data['nombre'],
            $data['tipo'] ?? 'laboratorio',
            $data['fecha'],
            $data['resultado'] ?? null,
            $data['observaciones'] ?? null
        ]
    );

    \App\Utils\Response::success(['id' => $db->lastInsertId()], 'Estudio registrado', 201);
}, ['auth']);

// ===== RUTAS DE PLANES NUTRICIONALES =====
use App\Controllers\PlanNutricionalController;

// Obtener planes del especialista
route('GET', '/api/nutricion/planes/especialista/(\d+)', function($especialistaId) {
    $controller = new PlanNutricionalController();
    $controller->getPlanesEspecialista($especialistaId);
}, ['auth']);

// Subir PDF y crear plan
route('POST', '/api/nutricion/planes/upload/(\d+)', function($especialistaId) {
    $controller = new PlanNutricionalController();
    $controller->uploadPlan($especialistaId);
}, ['auth']);

// Obtener detalle de un plan
route('GET', '/api/nutricion/planes/(\d+)', function($planId) {
    $controller = new PlanNutricionalController();
    $controller->getPlan($planId);
}, ['auth']);

// Actualizar contenido del plan
route('PUT', '/api/nutricion/planes/(\d+)', function($planId) {
    $controller = new PlanNutricionalController();
    $controller->updatePlanContent($planId);
}, ['auth']);

// Eliminar plan
route('DELETE', '/api/nutricion/planes/(\d+)', function($planId) {
    $controller = new PlanNutricionalController();
    $controller->deletePlan($planId);
}, ['auth']);

// Asignar plan a paciente
route('POST', '/api/nutricion/planes/(\d+)/asignar', function($planId) {
    $controller = new PlanNutricionalController();
    $controller->asignarPlan($planId);
}, ['auth']);

// Obtener plan activo del paciente
route('GET', '/api/nutricion/plan-paciente/(\d+)', function($pacienteId) {
    $controller = new PlanNutricionalController();
    $controller->getPlanPaciente($pacienteId);
}, ['auth']);

// Registrar seguimiento del plan
route('POST', '/api/nutricion/plan-paciente/(\d+)/seguimiento', function($pacienteId) {
    $controller = new PlanNutricionalController();
    $controller->registrarSeguimiento($pacienteId);
}, ['auth']);
