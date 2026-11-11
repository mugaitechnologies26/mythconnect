<?php
/**
 * Myth Connect.ai - Hostinger Intelligent Auto-Healing API Proxy
 * Bridges web requests to internal Node.js backend
 */

$candidate_ports = [5050, 5000, 3000];
$candidate_hosts = ['127.0.0.1', 'localhost'];

$path = isset($_GET['__path']) ? $_GET['__path'] : '';
$query = $_SERVER['QUERY_STRING'] ?? '';

// Strip __path from query string
$query_parts = [];
parse_str($query, $query_parts);
unset($query_parts['__path']);
$clean_query = http_build_query($query_parts);
$subpath = '/api' . ($path ? '/' . ltrim($path, '/') : '') . ($clean_query ? '?' . $clean_query : '');

// Forward headers
$headers = [];
$incoming_headers = function_exists('getallheaders') ? getallheaders() : [];
foreach ($incoming_headers as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'host' && $lower !== 'content-length') {
        $headers[] = "$name: $value";
    }
}

// Read body
$method = $_SERVER['REQUEST_METHOD'];
$body = '';
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $body = file_get_contents('php://input');
    $headers[] = 'Content-Length: ' . strlen($body);
}

function try_request($target_url, $method, $headers, $body, $timeout = 2) {
    $ch = curl_init($target_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if (!empty($body)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    return ['response' => $response, 'errno' => $errno, 'error' => $error, 'info' => $info];
}

$success_result = null;

// Attempt connection across candidate ports and loopback hosts
foreach ($candidate_hosts as $h) {
    foreach ($candidate_ports as $p) {
        $url = "http://{$h}:{$p}{$subpath}";
        $res = try_request($url, $method, $headers, $body, 1);
        if ($res['errno'] === 0) {
            $success_result = $res;
            break 2;
        }
    }
}

// If no backend is responding, auto-heal and boot the Node.js process
if (!$success_result) {
    $home = getenv('HOME') ?: (isset($_SERVER['DOCUMENT_ROOT']) ? dirname($_SERVER['DOCUMENT_ROOT']) : '/home/u395270878');
    $project_dir = "$home/mythconnect";
    $backend_dir = "$project_dir/backend-node";

    // Detect node binary
    $node_bin = '/opt/alt/alt-nodejs20/root/usr/bin/node';
    if (!file_exists($node_bin)) {
        $node_bin = trim(`which node 2>/dev/null` ?: '');
    }
    if (!$node_bin || !file_exists($node_bin)) {
        $node_bin = "$home/.nvm/versions/node/v20.20.2/bin/node";
    }

    if (file_exists("$backend_dir/server.js") && file_exists($node_bin)) {
        // Start process in background
        $cmd = "cd " . escapeshellarg($backend_dir) . " && PORT=5050 nohup " . escapeshellarg($node_bin) . " server.js > " . escapeshellarg("$home/backend.log") . " 2>&1 &";
        exec($cmd);
        usleep(1500000); // Wait 1.5s for initialization

        // Retry connection
        $retry_url = "http://127.0.0.1:5050{$subpath}";
        $res = try_request($retry_url, $method, $headers, $body, 3);
        if ($res['errno'] === 0) {
            $success_result = $res;
        }
    }
}

// Final response dispatch
if ($success_result && $success_result['errno'] === 0) {
    $response = $success_result['response'];
    $header_size = $success_result['info']['header_size'];
    $status_code = $success_result['info']['http_code'];
    $res_headers = substr($response, 0, $header_size);
    $res_body = substr($response, $header_size);

    http_response_code($status_code);
    foreach (explode("\r\n", $res_headers) as $hdr) {
        if ($hdr && !preg_match('/^(Transfer-Encoding|Connection):/i', $hdr)) {
            header($hdr, false);
        }
    }
    echo $res_body;
} else {
    http_response_code(502);
    header('Content-Type: application/json');
    $last_error = $success_result ? $success_result['error'] : 'Backend service offline or unreachable on loopback';
    echo json_encode([
        'success' => false,
        'error' => 'BackendUnavailable',
        'message' => "Unable to connect to Node.js backend: $last_error"
    ]);
}
