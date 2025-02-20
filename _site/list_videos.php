<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get the folder parameter
    $folder = isset($_GET['folder']) ? $_GET['folder'] : '';
    
    // Validate folder parameter
    if (empty($folder)) {
        throw new Exception('Folder parameter is required');
    }
    
    // Base directory for videos
    $baseDir = 'static/outputs_isd_new/';
    
    // Full path to the folder
    $fullPath = $baseDir . $folder;
    
    // Debug current directory
    $currentDir = getcwd();
    
    // Validate that the directory exists and is within allowed path
    if (!file_exists($fullPath) || !is_dir($fullPath)) {
        throw new Exception("Invalid folder path: $fullPath (current dir: $currentDir)");
    }
    
    // Get all MP4 files in the directory
    $videos = [];
    $files = scandir($fullPath);
    
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..' && pathinfo($file, PATHINFO_EXTENSION) === 'mp4') {
            $videos[] = [
                'title' => pathinfo($file, PATHINFO_FILENAME),
                'path' => 'outputs_isd_new/' . $folder . '/' . $file  // Simplified path for client
            ];
        }
    }
    
    // Sort videos by title
    usort($videos, function($a, $b) {
        return strcmp($a['title'], $b['title']);
    });
    
    // Return the list of videos
    echo json_encode([
        'success' => true,
        'videos' => $videos,
        'debug' => [
            'folder' => $folder,
            'fullPath' => $fullPath,
            'currentDir' => $currentDir,
            'fileCount' => count($videos),
            'files' => $files
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 