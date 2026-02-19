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

$sql = "INSERT INTO salary_records (
    id, teacher_id, amount, salary_month, status, payment_date, payment_mode, receipt_no
) VALUES (
    :id, :teacherId, :amount, :month, :status, :date, :mode, :receiptNo
)";

try {
    $stmt = $pdo->prepare($sql);
    $params = [
        ':id' => $data['id'],
        ':teacherId' => $data['teacherId'],
        ':amount' => $data['amount'],
        ':month' => $data['month'],
        ':status' => $data['status'],
        ':date' => $data['date'],
        ':mode' => $data['mode'],
        ':receiptNo' => $data['receiptNo'] ?? null
    ];
    $stmt->execute($params);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>