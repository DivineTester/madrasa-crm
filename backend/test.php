<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    'success' => true,
    'message' => 'Backend is accessible',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion()
]);
?>