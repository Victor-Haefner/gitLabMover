<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

$data = json_decode(file_get_contents("php://input"), true);
$projectID = $data["projectID"];
$namespace = $data["namespace"];
$owner = $data["owner"];
$name = $data["name"];

$path = "/tmp/project-$projectID.tar.gz";

if (!file_exists($path)) {
    echo "Archive $path not found! ..abord";
    exit();
}

try {
    // Import via rake
    $cmd = sprintf(
        'sudo gitlab-rake "gitlab:import_export:import[%s,%s,%s,%s]"',
        escapeshellarg($namespace),
        escapeshellarg($owner),
        escapeshellarg($name),
        escapeshellarg($path)
    );
    
    $cmd = 'sudo -u gitlab /usr/bin/gitlab-rake "gitlab:env:info"'; // for testing
    
    echo "executing: $cmd\n";
    $output = shell_exec($cmd);
    echo " result: $output\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

