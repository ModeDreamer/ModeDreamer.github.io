<?php
header('Content-Type: application/json');

function getMP4Files($directory) {
    $files = [];
    if (is_dir($directory)) {
        $items = scandir($directory);
        foreach ($items as $item) {
            if (pathinfo($item, PATHINFO_EXTENSION) === 'mp4') {
                $files[] = $item;
            }
        }
    }
    return $files;
}

$baseDir = 'static/outputs_isd_new/';
$folder = isset($_GET['folder']) ? $_GET['folder'] : '';
$allowedFolders = ['GPTEval3D', 'Other', 'T3Bench'];

if (!in_array($folder, $allowedFolders)) {
    echo json_encode(['error' => 'Invalid folder']);
    exit;
}

$fullPath = $baseDir . $folder;
$files = getMP4Files($fullPath);
sort($files); // Sort files alphabetically

echo json_encode(['files' => $files]);
?> 