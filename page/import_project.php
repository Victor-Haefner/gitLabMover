<?php
$server = "https://oldgitlab.example.com";
$token  = "YOUR_OLD_TOKEN";
$projectId = 123; // You’d get this first with the search API

try {


    // Import via rake (⚠ requires privileges!)
    $namespace = "victor";
    $owner = "victor";
    $projectName = "test3";
    $archive = "/tmp/project.tar.gz";

    $cmd = sprintf(
        'sudo gitlab-rake "gitlab:import_export:import[%s,%s,%s,%s]"',
        escapeshellarg($namespace),
        escapeshellarg($owner),
        escapeshellarg($projectName),
        escapeshellarg($archive)
    );
    shell_exec($cmd);

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

