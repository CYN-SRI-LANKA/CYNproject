<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            // Get query parameters
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
            
            $query = "SELECT id, title, description, image_path, thumbnail_path, category, tags, created_at 
                     FROM gallery WHERE status = 'active'";
            
            $params = [];
            if ($category && $category !== 'all') {
                $query .= " AND category = :category";
                $params[':category'] = $category;
            }
            
            $query .= " ORDER BY display_order ASC, created_at DESC LIMIT :limit OFFSET :offset";
            
            $stmt = $db->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Add full URLs for React
            $baseUrl = 'http://localhost/CYN-Admin/uploads/gallery/';
            foreach ($items as &$item) {
                $item['image_url'] = $baseUrl . $item['image_path'];
                $item['thumbnail_url'] = $baseUrl . ($item['thumbnail_path'] ?: $item['image_path']);
                $item['tags'] = $item['tags'] ? explode(',', $item['tags']) : [];
            }
            
            // Get total count for pagination
            $count_query = "SELECT COUNT(*) as total FROM gallery WHERE status = 'active'";
            if ($category && $category !== 'all') {
                $count_query .= " AND category = :category";
            }
            $count_stmt = $db->prepare($count_query);
            if ($category && $category !== 'all') {
                $count_stmt->bindParam(':category', $category);
            }
            $count_stmt->execute();
            $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $items,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                    'has_more' => ($offset + $limit) < $total
                ]
            ]);
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}
?>
