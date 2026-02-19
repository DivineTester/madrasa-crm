<?php
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

// Allow the actual request
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require 'db.php';
$data = json_decode(file_get_contents("php://input"), true);

$loginId = $data['loginId'] ?? '';
$password = $data['password'] ?? '';

if ($loginId && $password) {
    // First check admin credentials
    $stmt = $pdo->prepare("SELECT * FROM admin_credentials WHERE login_id = :loginId AND password = :password");
    $stmt->execute([':loginId' => $loginId, ':password' => $password]);
    $admin = $stmt->fetch();

    if ($admin) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 'admin-1',
                'name' => 'Mudir (Director)',
                'email' => 'admin@madrasa.com',
                'role' => 'ADMIN',
                'avatar' => 'https://ui-avatars.com/api/?name=Mudir&background=064e3b&color=fff'
            ]
        ]);
        exit();
    }

    // If not admin, check teacher credentials
    $stmt = $pdo->prepare("SELECT * FROM teachers WHERE login_id = :loginId AND password = :password");
    $stmt->execute([':loginId' => $loginId, ':password' => $password]);
    $teacher = $stmt->fetch();

    if ($teacher) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $teacher['id'],
                'name' => $teacher['full_name'],
                'email' => $teacher['email'],
                'role' => 'TEACHER',
                'teacherId' => $teacher['id'],
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($teacher['full_name']) . '&background=d97706&color=fff'
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Login ID and password are required']);
}