<?php
// Script de diagnóstico para verificar contraseñas

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $pdo = new PDO(
        "mysql:host=localhost;port=3307;dbname=vitalia_db;charset=utf8mb4",
        "root",
        "12345"
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener usuario
    $stmt = $pdo->query("SELECT id, email, password_hash, activo FROM usuarios WHERE email = 'paciente1@test.com'");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }

    // Probar verificación
    $password = '123456';
    $hashFromDB = $user['password_hash'];
    $verification = password_verify($password, $hashFromDB);

    // Generar nuevo hash para comparar
    $newHash = password_hash('123456', PASSWORD_BCRYPT);

    echo json_encode([
        'user_found' => true,
        'email' => $user['email'],
        'activo' => $user['activo'],
        'hash_in_db' => $hashFromDB,
        'hash_length' => strlen($hashFromDB),
        'password_to_verify' => $password,
        'verification_result' => $verification,
        'new_hash_for_123456' => $newHash,
        'verify_new_hash' => password_verify('123456', $newHash)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
