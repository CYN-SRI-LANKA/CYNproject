<?php
class Event {
    private $conn;
    private $table_name = "events";

    public $id;
    public $title;
    public $description;
    public $date_event;
    public $image_path;
    public $route_path;
    public $created_at;
    public $is_active;

    public function __construct($db) {
        $this->conn = $db;
    }

    function read() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE is_active = 1 ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title=:title, description=:description, date_event=:date_event, 
                      image_path=:image_path, route_path=:route_path";
        
        $stmt = $this->conn->prepare($query);
        
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->date_event = htmlspecialchars(strip_tags($this->date_event));
        $this->image_path = htmlspecialchars(strip_tags($this->image_path));
        $this->route_path = htmlspecialchars(strip_tags($this->route_path));
        
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":date_event", $this->date_event);
        $stmt->bindParam(":image_path", $this->image_path);
        $stmt->bindParam(":route_path", $this->route_path);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->date_event = $row['date_event'];
            $this->image_path = $row['image_path'];
            $this->route_path = $row['route_path'];
            $this->created_at = $row['created_at'];
            return true;
        }
        return false;
    }
}
?>
