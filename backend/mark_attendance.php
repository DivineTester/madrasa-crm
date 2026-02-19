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
$records = json_decode(file_get_contents("php://input"), true);

if (!is_array($records)) die(json_encode(['error' => 'Invalid data']));

try {
    $pdo->beginTransaction();
    
    // Using ON DUPLICATE KEY UPDATE to ensure only one record per student/date
    // Explicitly assigning variables in UPDATE to ensure compatibility across all MySQL versions
    $sql = "INSERT INTO attendance (student_id, teacher_id, course_id, attendance_date, status, remarks, marked_by_role) 
            VALUES (:studentId, :teacherId, :courseId, :date, :status, :remarks, :markedByRole)
            ON DUPLICATE KEY UPDATE 
                status = :status_upd, 
                remarks = :remarks_upd,
                marked_by_role = :role_upd,
                course_id = :course_upd";
    
    $stmt = $pdo->prepare($sql);

    foreach ($records as $r) {
        $studentId = $r['studentId'] === 'N/A' ? null : $r['studentId'];
        $status = $r['status'];
        $remarks = $r['remarks'] ?? '';
        $role = $r['markedByRole'] ?? 'ADMIN';
        $courseId = $r['courseId'] === 'STAFF' ? null : $r['courseId'];
        
        $stmt->execute([
            ':studentId' => $studentId,
            ':teacherId' => $r['teacherId'],
            ':courseId' => $courseId,
            ':date' => $r['date'],
            ':status' => $status,
            ':remarks' => $remarks,
            ':markedByRole' => $role,
            // Parameters for the UPDATE part
            ':status_upd' => $status,
            ':remarks_upd' => $remarks,
            ':role_upd' => $role,
            ':course_upd' => $courseId
        ]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>