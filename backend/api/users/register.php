<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    try {
        // Get JSON input from React
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // Validate required fields
        $required_fields = ['full_name', 'email'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => ucfirst(str_replace('_', ' ', $field)) . ' is required'
                ]);
                exit;
            }
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid email format'
            ]);
            exit;
        }
        
        // Check if email already exists
        $check_query = "SELECT id FROM user_signups WHERE email = :email";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':email', $data['email']);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'message' => 'Email already registered'
            ]);
            exit;
        }
        
        // Insert new signup
        $query = "INSERT INTO user_signups (full_name, email, phone, organization, country, 
                 registration_type, interests, how_heard, status, created_at) 
                 VALUES (:full_name, :email, :phone, :organization, :country, 
                 :registration_type, :interests, :how_heard, 'pending', NOW())";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':full_name', $data['full_name']);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':phone', $data['phone'] ?? null);
        $stmt->bindParam(':organization', $data['organization'] ?? null);
        $stmt->bindParam(':country', $data['country'] ?? null);
        $stmt->bindParam(':registration_type', $data['registration_type'] ?? null);
        $stmt->bindParam(':interests', isset($data['interests']) ? implode(',', $data['interests']) : null);
        $stmt->bindParam(':how_heard', $data['how_heard'] ?? null);
        
        if ($stmt->execute()) {
            $user_id = $db->lastInsertId();
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'id' => $user_id,
                    'email' => $data['email'],
                    'full_name' => $data['full_name']
                ]
            ]);
        } else {
            throw new Exception('Failed to insert record');
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Registration failed: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}
?>
