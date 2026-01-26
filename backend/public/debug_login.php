<?php
/**
 * Script de diagnóstico para login
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Conexión directa
    $pdo = new PDO(
        "mysql:host=localhost;port=3307;dbname=vitalia_db;charset=utf8mb4",
        "root",
        "12345"
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $email = 'paciente1@test.com';
    $password = '123456';

    // 1. Buscar usuario
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['error' => 'Usuario no encontrado', 'email' => $email]);
        exit;
    }

    // 2. Mostrar datos del usuario
    $result = [
        'step1_user_found' => true,
        'user_id' => $user['id'],
        'email' => $user['email'],
        'nombre' => $user['nombre_completo'],
        'activo' => $user['activo'],
        'password_hash_in_db' => $user['password_hash'],
        'hash_length' => strlen($user['password_hash'] ?? ''),
    ];

    // 3. Verificar contraseña
    $hashFromDB = $user['password_hash'];
    $result['step2_password_verify'] = password_verify($password, $hashFromDB);

    // 4. Generar hash correcto para 123456
    $correctHash = password_hash('123456', PASSWORD_BCRYPT);
    $result['step3_correct_hash_for_123456'] = $correctHash;
    $result['step3_verify_new_hash'] = password_verify('123456', $correctHash);

    // 5. Verificar si el hash actual es para otra contraseña común
    $commonPasswords = ['password', '123456', 'admin', '12345678', 'qwerty'];
    $result['step4_hash_matches'] = [];
    foreach ($commonPasswords as $pwd) {
        if (password_verify($pwd, $hashFromDB)) {
            $result['step4_hash_matches'][] = $pwd;
        }
    }

    // 6. SQL para corregir
    $result['step5_fix_sql'] = "UPDATE usuarios SET password_hash = '$correctHash' WHERE id > 0;";

    // 7. Intentar corregir automáticamente
    $updateStmt = $pdo->prepare("UPDATE usuarios SET password_hash = ?, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?");
    $updateStmt->execute([$correctHash, $user['id']]);
    $result['step6_auto_fix'] = 'Password actualizado para usuario ' . $user['id'];

    // 8. Verificar corrección
    $stmt2 = $pdo->prepare("SELECT password_hash FROM usuarios WHERE id = ?");
    $stmt2->execute([$user['id']]);
    $updatedUser = $stmt2->fetch(PDO::FETCH_ASSOC);
    $result['step7_verification'] = password_verify('123456', $updatedUser['password_hash']);

    echo json_encode($result, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
