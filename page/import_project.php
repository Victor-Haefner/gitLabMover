<?php

$data = json_decode(file_get_contents("php://input"), true);
$projectID = $data["projectID"];
$namespace = $data["namespace"];
$owner = $data["owner"];
$name = $data["name"];

$path = "/tmp/project-$projectID.tar.gz";

try {
    // Import via rake (⚠ requires privileges!)
    $cmd = sprintf(
        'sudo gitlab-rake "gitlab:import_export:import[%s,%s,%s,%s]"',
        escapeshellarg($namespace),
        escapeshellarg($owner),
        escapeshellarg($name),
        escapeshellarg($path)
    );
    shell_exec($cmd);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

