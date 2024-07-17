<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "admin_bd";
$password = "ugm2024";
$dbname = "lateresa";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Obtener datos del POST
$data = json_decode(file_get_contents("php://input"), true);
if ($data) {
    $timeInZone = $data['timeInZone'];
    $totalEntries = $data['totalEntries'];
    $averageTimeInZone = $data['averageTimeInZone'];

    // Insertar datos en la tabla
    $stmt = $conn->prepare("INSERT INTO entries (timeInZone, totalEntries, averageTimeInZone) VALUES (?, ?, ?)");
    $stmt->bind_param("dii", $timeInZone, $totalEntries, $averageTimeInZone);

    if ($stmt->execute()) {
        echo json_encode(["message" => "New record created successfully"]);
    } else {
        echo json_encode(["error" => "Error: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "No data received"]);
}

$conn->close();
?>
