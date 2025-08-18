<?php
header("Content-Type: application/json");

$configFile = "config.json";

if (file_exists($configFile)) {
    echo file_get_contents($configFile);
} else {
    echo json_encode(["left" => [], "right" => []]);
}
