<?php
// Minimal, CORS-enabled password update endpoint
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'db.php';

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit();
}

$current = $data['currentPassword'] ?? '';
$new = $data['newPassword'] ?? '';

if (empty($current) || empty($new)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Both passwords required']);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT id FROM admin_credentials WHERE login_id = 'admin' AND password = ?");
    $stmt->execute([$current]);

    if ($stmt->fetch()) {
        $update = $pdo->prepare("UPDATE admin_credentials SET password = ? WHERE login_id = 'admin'");
        $update->execute([$new]);
        echo json_encode(['success' => true, 'message' => 'Password updated']);
        exit();
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Wrong current password']);
        exit();
    }
} catch (PDOException $e) {
    error_log("update_admin_password.php DB error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
    exit();
}
?>