<?php
$configFile = "config.json";

// Read existing config
if (file_exists($configFile)) {
    $config = json_decode(file_get_contents($configFile), true);
} else {
    $config = ["left" => [], "right" => []];
}

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$panel = $data["panel"];
$key = $data["key"];
$value = $data["value"];

// Update config
$config[$panel][$key] = $value;

// Save back to file
file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT));

