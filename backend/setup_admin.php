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

header("Content-Type: application/json; charset=UTF-8");

try {
    // Create table if it doesn't exist
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS admin_credentials (
            id INT PRIMARY KEY AUTO_INCREMENT,
            login_id VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");

    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id FROM admin_credentials WHERE login_id = 'admin'");
    $stmt->execute();
    $exists = $stmt->fetch();

    if (!$exists) {
        // Insert default admin credentials
        $insertStmt = $pdo->prepare("INSERT INTO admin_credentials (login_id, password) VALUES ('admin', 'admin')");
        $insertStmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Admin credentials table created and default admin user inserted',
            'login_id' => 'admin',
            'password' => 'admin'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Admin user already exists',
            'login_id' => 'admin'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>