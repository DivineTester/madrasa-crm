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

$sql = "INSERT INTO fee_records (
    id, student_id, amount_paid, payment_date, for_month, 
    payment_mode, reference, payment_status, receipt_no
) VALUES (
    :id, :studentId, :amountPaid, :date, :month,
    :mode, :reference, :status, :receiptNo
)";

try {
    $stmt = $pdo->prepare($sql);
    $params = [
        ':id' => $data['id'],
        ':studentId' => $data['studentId'],
        ':amountPaid' => $data['amountPaid'],
        ':date' => $data['date'],
        ':month' => $data['month'],
        ':mode' => $data['mode'],
        ':reference' => $data['reference'],
        ':status' => $data['status'],
        ':receiptNo' => $data['receiptNo']
    ];
    $stmt->execute($params);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>