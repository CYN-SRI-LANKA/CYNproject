<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT DISTINCT category, COUNT(*) as count 
             FROM gallery 
             WHERE status = 'active' AND category IS NOT NULL AND category != '' 
             GROUP BY category 
             ORDER BY category ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $categories
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
