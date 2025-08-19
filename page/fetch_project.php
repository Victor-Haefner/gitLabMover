<?php

// needs:
//  sudo apt install php8.1-curl

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

function gitlabApiRequest($url, $token, $method = 'GET', $outputFile = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["PRIVATE-TOKEN: $token"]);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($outputFile) {
        $fp = fopen($outputFile, 'w');
        curl_setopt($ch, CURLOPT_FILE, $fp);
    }

    $response = curl_exec($ch);
    if ($outputFile) fclose($fp);

    if (curl_errno($ch)) {
        throw new Exception("Curl error: " . curl_error($ch));
    }

    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status >= 400) {
        throw new Exception("GitLab API error $status: $response");
    }

    return $response;
}

// Start export
function exportProject($server, $token, $projectId) {
    $url = "$server/api/v4/projects/$projectId/export";
    gitlabApiRequest($url, $token, 'POST');
}

// Poll for export status
function waitForExport($server, $token, $projectId) {
    $url = "$server/api/v4/projects/$projectId/export";
    while (true) {
        $res = gitlabApiRequest($url, $token);
        $data = json_decode($res, true);
        $status = $data['export_status'] ?? null;

        if ($status === 'finished') {
            return true;
        }
        if ($status === 'failed') {
            throw new Exception("Export failed");
        }
        sleep(10);
    }
}

// Download tar.gz
function downloadExport($server, $token, $projectId, $destFile) {
	$url = "$server/api/v4/projects/$projectId/export/download";
	echo "  $url\n";
	gitlabApiRequest($url, $token, 'GET', $destFile);
}

$data = json_decode(file_get_contents("php://input"), true);
$projectID = $data["projectID"];
$token = $data["token"];
$server = $data["server"];

$path = "/tmp/project-$projectID.tar.gz";

if (file_exists($path)) {
	echo "Project already fetched!";
} else {
	echo "Requesting export...\n";
	exportProject($server, $token, $projectID);
	echo "Waiting for export...\n";
	waitForExport($server, $token, $projectID);
	echo "Downloading...\n";
	downloadExport($server, $token, $projectID, $path);
	echo "Download finished!\n";
}







