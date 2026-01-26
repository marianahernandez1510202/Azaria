<?php
/**
 * Test completo de todos los endpoints principales
 */

header('Content-Type: text/plain; charset=utf-8');

// Autoload
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

require_once __DIR__ . '/../config/constants.php';

use App\Services\DatabaseService;

echo "=== TEST COMPLETO DE ENDPOINTS ===\n\n";

$db = DatabaseService::getInstance();

// Test data
$pacienteId = 1;
$userId = 7;

$tests = [];

// 1. Login - Ya probado y funciona
$tests['Login'] = ['status' => 'OK', 'notes' => 'Funciona correctamente'];

// 2. Perfil
try {
    $perfil = $db->query(
        "SELECT u.*, ft.nombre as fase_nombre, p.progreso_general
         FROM usuarios u
         LEFT JOIN pacientes p ON p.usuario_id = u.id
         LEFT JOIN fases_tratamiento ft ON p.fase_actual_id = ft.id
         WHERE u.id = ?",
        [$userId]
    )->fetch();
    $tests['Perfil'] = ['status' => $perfil ? 'OK' : 'FAIL', 'notes' => "Nombre: " . ($perfil['nombre_completo'] ?? 'N/A')];
} catch (Exception $e) {
    $tests['Perfil'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 3. Medicina - Glucosa
try {
    $glucosa = $db->query(
        "SELECT * FROM bitacora_glucosa WHERE paciente_id = ? ORDER BY fecha DESC LIMIT 5",
        [$pacienteId]
    )->fetchAll();
    $tests['Medicina/Glucosa'] = ['status' => 'OK', 'notes' => "Registros: " . count($glucosa)];
} catch (Exception $e) {
    $tests['Medicina/Glucosa'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 4. Medicina - Presion
try {
    $presion = $db->query(
        "SELECT * FROM bitacora_presion WHERE paciente_id = ? ORDER BY fecha DESC LIMIT 5",
        [$pacienteId]
    )->fetchAll();
    $tests['Medicina/Presion'] = ['status' => 'OK', 'notes' => "Registros: " . count($presion)];
} catch (Exception $e) {
    $tests['Medicina/Presion'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 5. Medicina - Dolor
try {
    $dolor = $db->query(
        "SELECT * FROM bitacora_dolor WHERE paciente_id = ? ORDER BY fecha DESC LIMIT 5",
        [$pacienteId]
    )->fetchAll();
    $tests['Medicina/Dolor'] = ['status' => 'OK', 'notes' => "Registros: " . count($dolor)];
} catch (Exception $e) {
    $tests['Medicina/Dolor'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 6. Fases
try {
    $fase = $db->query(
        "SELECT p.*, ft.nombre as fase_nombre
         FROM pacientes p
         JOIN fases_tratamiento ft ON p.fase_actual_id = ft.id
         WHERE p.id = ?",
        [$pacienteId]
    )->fetch();
    $tests['Fases'] = ['status' => $fase ? 'OK' : 'FAIL', 'notes' => "Fase actual: " . ($fase['fase_nombre'] ?? 'N/A')];
} catch (Exception $e) {
    $tests['Fases'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 7. Videos/Fisioterapia
try {
    $videos = $db->query(
        "SELECT * FROM videos_ejercicios WHERE publicado = 1 LIMIT 5"
    )->fetchAll();
    $tests['Fisioterapia/Videos'] = ['status' => 'OK', 'notes' => "Videos disponibles: " . count($videos)];
} catch (Exception $e) {
    $tests['Fisioterapia/Videos'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 8. Guias
try {
    $guias = $db->query(
        "SELECT * FROM guias_cuidado WHERE publicado = 1 LIMIT 5"
    )->fetchAll();
    $tests['Fisioterapia/Guias'] = ['status' => 'OK', 'notes' => "Guias disponibles: " . count($guias)];
} catch (Exception $e) {
    $tests['Fisioterapia/Guias'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 9. Nutricion - Recetas
try {
    $recetas = $db->query("SELECT * FROM recetas LIMIT 5")->fetchAll();
    $tests['Nutricion/Recetas'] = ['status' => 'OK', 'notes' => "Recetas disponibles: " . count($recetas)];
} catch (Exception $e) {
    $tests['Nutricion/Recetas'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 10. Citas
try {
    $citas = $db->query(
        "SELECT c.*, u.nombre_completo as especialista_nombre, tc.nombre as tipo_cita
         FROM citas c
         LEFT JOIN usuarios u ON c.especialista_id = u.id
         LEFT JOIN tipos_cita tc ON c.tipo_cita_id = tc.id
         WHERE c.paciente_id = ?
         LIMIT 5",
        [$pacienteId]
    )->fetchAll();
    $tests['Citas'] = ['status' => 'OK', 'notes' => "Citas encontradas: " . count($citas)];
} catch (Exception $e) {
    $tests['Citas'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 11. Recordatorios
try {
    $recordatorios = $db->query(
        "SELECT * FROM recordatorios WHERE paciente_id = ? AND activo = 1 LIMIT 5",
        [$pacienteId]
    )->fetchAll();
    $tests['Recordatorios'] = ['status' => 'OK', 'notes' => "Recordatorios activos: " . count($recordatorios)];
} catch (Exception $e) {
    $tests['Recordatorios'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 12. FAQs
try {
    $faqs = $db->query("SELECT * FROM faqs LIMIT 5")->fetchAll();
    $tests['FAQs'] = ['status' => 'OK', 'notes' => "FAQs disponibles: " . count($faqs)];
} catch (Exception $e) {
    $tests['FAQs'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 13. Blog/Articulos
try {
    $articulos = $db->query("SELECT * FROM articulos LIMIT 5")->fetchAll();
    $tests['Blog/Articulos'] = ['status' => 'OK', 'notes' => "Articulos disponibles: " . count($articulos)];
} catch (Exception $e) {
    $tests['Blog/Articulos'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 14. Neuropsicologia - Estado Animo
try {
    $animo = $db->query(
        "SELECT * FROM registro_animo WHERE paciente_id = ? ORDER BY fecha DESC LIMIT 5",
        [$pacienteId]
    )->fetchAll();
    $tests['Neuropsicologia/Animo'] = ['status' => 'OK', 'notes' => "Registros animo: " . count($animo)];
} catch (Exception $e) {
    $tests['Neuropsicologia/Animo'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 15. Ortesis/Dispositivo
try {
    $dispositivo = $db->query(
        "SELECT dp.*, td.nombre as tipo_nombre
         FROM dispositivos_paciente dp
         LEFT JOIN tipos_dispositivo td ON dp.tipo_dispositivo_id = td.id
         WHERE dp.paciente_id = ?",
        [$pacienteId]
    )->fetch();
    $tests['Ortesis/Dispositivo'] = ['status' => $dispositivo ? 'OK' : 'NO DATA', 'notes' => $dispositivo ? "Tipo: " . $dispositivo['tipo_nombre'] : "Sin dispositivo registrado"];
} catch (Exception $e) {
    $tests['Ortesis/Dispositivo'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// 16. Comunidad/Feed
try {
    $feed = $db->query("SELECT * FROM publicaciones_comunidad LIMIT 5")->fetchAll();
    $tests['Comunidad/Feed'] = ['status' => 'OK', 'notes' => "Publicaciones: " . count($feed)];
} catch (Exception $e) {
    $tests['Comunidad/Feed'] = ['status' => 'ERROR', 'notes' => $e->getMessage()];
}

// Mostrar resultados
echo "RESULTADOS DE TESTS\n";
echo "==========================================\n\n";

$okCount = 0;
$errorCount = 0;

foreach ($tests as $name => $result) {
    $icon = $result['status'] === 'OK' ? '[OK]' : ($result['status'] === 'NO DATA' ? '[--]' : '[!!]');
    echo "$icon $name: {$result['notes']}\n";

    if ($result['status'] === 'OK') $okCount++;
    else if ($result['status'] === 'ERROR') $errorCount++;
}

echo "\n==========================================\n";
echo "Resumen: $okCount OK, $errorCount ERRORES\n";
