<?php
header('Content-Type: text/plain');
spl_autoload_register(function ($class) {
    $prefix = 'App\\';
    $baseDir = __DIR__ . '/../src/';
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) return;
    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    if (file_exists($file)) require $file;
});
require_once __DIR__ . '/../config/constants.php';

use App\Services\DatabaseService;
$db = DatabaseService::getInstance();

// Verificar si existe articulo_likes
try {
    $db->query("DESCRIBE articulo_likes");
    echo "articulo_likes YA EXISTE\n";
} catch(Exception $e) {
    echo "Creando articulo_likes...\n";
    $db->query("CREATE TABLE articulo_likes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        articulo_id INT UNSIGNED NOT NULL,
        usuario_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (articulo_id, usuario_id),
        INDEX idx_articulo (articulo_id),
        INDEX idx_usuario (usuario_id)
    )");
    echo "TABLA CREADA\n";
}

// Verificar si existe comentarios_articulos
try {
    $db->query("DESCRIBE comentarios_articulos");
    echo "comentarios_articulos YA EXISTE\n";
} catch(Exception $e) {
    echo "Creando comentarios_articulos...\n";
    $db->query("CREATE TABLE comentarios_articulos (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        articulo_id INT UNSIGNED NOT NULL,
        usuario_id INT UNSIGNED NOT NULL,
        contenido TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_articulo (articulo_id)
    )");
    echo "TABLA CREADA\n";
}

// Verificar columnas de articulos
try {
    $cols = $db->query("DESCRIBE articulos")->fetchAll();
    echo "\narticulos columnas:\n";
    foreach($cols as $c) echo "  - {$c['Field']}\n";
} catch(Exception $e) {
    echo "articulos: " . $e->getMessage() . "\n";
}

// =============================================
// TABLAS DE NUTRICION MEJORADO
// =============================================
echo "\n=== NUTRICION ===\n";

// Tabla registro_agua
try {
    $db->query("DESCRIBE registro_agua");
    echo "registro_agua YA EXISTE\n";
} catch(Exception $e) {
    echo "Creando registro_agua...\n";
    $db->query("CREATE TABLE registro_agua (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        paciente_id INT UNSIGNED NOT NULL,
        fecha DATE NOT NULL,
        cantidad DECIMAL(4,2) DEFAULT 0,
        vasos TINYINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_dia (paciente_id, fecha),
        INDEX idx_paciente (paciente_id)
    )");
    echo "TABLA CREADA\n";
}

// Tabla objetivos_nutricion
try {
    $db->query("DESCRIBE objetivos_nutricion");
    echo "objetivos_nutricion YA EXISTE\n";
} catch(Exception $e) {
    echo "Creando objetivos_nutricion...\n";
    $db->query("CREATE TABLE objetivos_nutricion (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        paciente_id INT UNSIGNED NOT NULL,
        calorias INT DEFAULT 1800,
        carbohidratos INT DEFAULT 167,
        proteinas INT DEFAULT 93,
        grasas INT DEFAULT 49,
        agua DECIMAL(4,2) DEFAULT 2.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_paciente (paciente_id)
    )");
    echo "TABLA CREADA\n";
}

// Tabla alimentos
try {
    $db->query("DESCRIBE alimentos");
    echo "alimentos YA EXISTE\n";
} catch(Exception $e) {
    echo "Creando alimentos...\n";
    $db->query("CREATE TABLE alimentos (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        porcion VARCHAR(50) DEFAULT '100g',
        calorias INT DEFAULT 0,
        carbohidratos INT DEFAULT 0,
        proteinas INT DEFAULT 0,
        grasas INT DEFAULT 0,
        fibra INT DEFAULT 0,
        categoria VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_nombre (nombre)
    )");
    echo "TABLA CREADA\n";

    // Insertar alimentos comunes
    $alimentos = [
        ['Manzana', '1 mediana', 95, 25, 0, 0, 4, 'frutas'],
        ['Platano', '1 mediano', 105, 27, 1, 0, 3, 'frutas'],
        ['Naranja', '1 mediana', 62, 15, 1, 0, 3, 'frutas'],
        ['Huevo cocido', '1 grande', 78, 1, 6, 5, 0, 'proteinas'],
        ['Pollo a la plancha', '100g', 165, 0, 31, 4, 0, 'proteinas'],
        ['Arroz blanco', '1 taza', 206, 45, 4, 0, 1, 'carbohidratos'],
        ['Pan integral', '1 rebanada', 69, 12, 4, 1, 2, 'carbohidratos'],
        ['Avena', '1/2 taza', 150, 27, 5, 3, 4, 'carbohidratos'],
        ['Leche descremada', '1 taza', 83, 12, 8, 0, 0, 'lacteos'],
        ['Yogurt natural', '1 taza', 149, 17, 9, 5, 0, 'lacteos'],
        ['Ensalada verde', '1 taza', 10, 2, 1, 0, 1, 'vegetales'],
        ['Brocoli cocido', '1 taza', 55, 11, 4, 1, 5, 'vegetales'],
        ['Aguacate', '1/2', 160, 9, 2, 15, 7, 'grasas'],
        ['Almendras', '1 onza', 164, 6, 6, 14, 4, 'grasas'],
        ['Cafe con leche', '1 taza', 67, 6, 4, 3, 0, 'bebidas']
    ];
    foreach ($alimentos as $a) {
        $db->query(
            "INSERT INTO alimentos (nombre, porcion, calorias, carbohidratos, proteinas, grasas, fibra, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            $a
        );
    }
    echo "Alimentos insertados: " . count($alimentos) . "\n";
}

// Verificar columnas adicionales en registro_comidas
try {
    $cols = $db->query("DESCRIBE registro_comidas")->fetchAll();
    $columnNames = array_column($cols, 'Field');

    if (!in_array('alimento_id', $columnNames)) {
        echo "Agregando columna alimento_id...\n";
        $db->query("ALTER TABLE registro_comidas ADD COLUMN alimento_id INT UNSIGNED NULL");
    }
    if (!in_array('calorias_override', $columnNames)) {
        echo "Agregando columna calorias_override...\n";
        $db->query("ALTER TABLE registro_comidas ADD COLUMN calorias_override INT NULL");
    }
    echo "registro_comidas OK\n";
} catch(Exception $e) {
    echo "registro_comidas: " . $e->getMessage() . "\n";
}

echo "\nDone!\n";
