<?php
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header('Access-Control-Allow-Origin: https://madrasa.quantumautomationssuite.com');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

// Allow the actual request
header('Access-Control-Allow-Origin: https://madrasa.quantumautomationsuite.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require 'db.php';

header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Retrieve settings
    try {
        $stmt = $pdo->query("SELECT * FROM system_settings WHERE id = 1");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$settings) {
            // Insert default settings if not exist
            $pdo->exec("INSERT INTO system_settings (id) VALUES (1)");
            $stmt = $pdo->query("SELECT * FROM system_settings WHERE id = 1");
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            'success' => true,
            'settings' => $settings
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to retrieve settings: ' . $e->getMessage()
        ]);
    }
} elseif ($method === 'POST') {
    // Update settings
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON data']);
        exit;
    }

    try {
        $fields = [];
        $values = [];
        $params = [];

        foreach ($data as $key => $value) {
            $fields[] = "`$key` = ?";
            $values[] = $value;
            $params[] = $value;
        }

        $sql = "UPDATE system_settings SET " . implode(', ', $fields) . ", updated_at = CURRENT_TIMESTAMP WHERE id = 1";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // If no row was updated, insert new
        if ($stmt->rowCount() === 0) {
            $fields = array_keys($data);
            $placeholders = array_fill(0, count($fields), '?');
            $sql = "INSERT INTO system_settings (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(array_values($data));
        }

        echo json_encode(['success' => true, 'message' => 'Settings updated successfully']);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to update settings: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>