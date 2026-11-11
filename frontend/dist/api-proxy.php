<?php
/**
 * Myth Connect.ai - Hostinger Intelligent Auto-Healing API Proxy & Diagnostic
 */

$path = isset($_GET['__path']) ? trim($_GET['__path'], '/') : '';

// -----------------------------------------------------------------------------
// Diagnostic Handler: /api/diag
// -----------------------------------------------------------------------------
if ($path === 'diag' || $path === 'debug') {
    header('Content-Type: application/json');
    $home = getenv('HOME') ?: (isset($_SERVER['DOCUMENT_ROOT']) ? dirname(dirname($_SERVER['DOCUMENT_ROOT'])) : '/home/u395270878');
    
    // Check running node processes
    $ps = shell_exec('ps aux | grep node 2>&1') ?: 'None';
    
    // Check backend log
    $log_file = "$home/backend.log";
    $log = file_exists($log_file) ? file_get_contents($log_file) : 'No log file found at ' . $log_file;
    if (strlen($log) > 2000) {
        $log = substr($log, -2000);
    }

    // Test ports
    $port_tests = [];
    foreach ([5050, 5000, 3000] as $port) {
        $fp = @fsockopen('127.0.0.1', $port, $errno, $errstr, 0.5);
        if ($fp) {
            $port_tests["127.0.0.1:$port"] = 'OPEN';
            fclose($fp);
        } else {
            $port_tests["127.0.0.1:$port"] = "CLOSED ($errstr)";
        }
    }

    echo json_encode([
        'server_time' => date('Y-m-d H:i:s'),
        'user' => get_current_user(),
        'doc_root' => $_SERVER['DOCUMENT_ROOT'] ?? '',
        'home' => $home,
        'ps_aux' => $ps,
        'port_tests' => $port_tests,
        'recent_backend_log' => $log
    ], JSON_PRETTY_PRINT);
    exit;
}

// -----------------------------------------------------------------------------
// Normal API Forwarding
// -----------------------------------------------------------------------------
$candidate_ports = [5050, 5000, 3000];
$candidate_hosts = ['127.0.0.1', 'localhost'];

$query = $_SERVER['QUERY_STRING'] ?? '';
$query_parts = [];
parse_str($query, $query_parts);
unset($query_parts['__path']);
$clean_query = http_build_query($query_parts);
$subpath = '/api' . ($path ? '/' . $path : '') . ($clean_query ? '?' . $clean_query : '');

$headers = [];
$incoming_headers = function_exists('getallheaders') ? getallheaders() : [];
foreach ($incoming_headers as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'host' && $lower !== 'content-length') {
        $headers[] = "$name: $value";
    }
}

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

// Try active ports
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

// Auto-heal: If all ports failed, spawn the Node server
if (!$success_result) {
    $home = getenv('HOME') ?: '/home/u395270878';
    $project_dir = "$home/mythconnect";
    $backend_dir = "$project_dir/backend-node";

    $node_bin = '/opt/alt/alt-nodejs20/root/usr/bin/node';
    if (!file_exists($node_bin)) {
        $node_bin = trim(`which node 2>/dev/null` ?: '');
    }

    if (file_exists("$backend_dir/server.js") && file_exists($node_bin)) {
        $cmd = "cd " . escapeshellarg($backend_dir) . " && PORT=5050 nohup " . escapeshellarg($node_bin) . " server.js > " . escapeshellarg("$home/backend.log") . " 2>&1 &";
        exec($cmd);
        usleep(1500000); // 1.5s wait

        $res = try_request("http://127.0.0.1:5050{$subpath}", $method, $headers, $body, 3);
        if ($res['errno'] === 0) {
            $success_result = $res;
        }
    }
}

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
        'message' => "Unable to connect to Node.js backend: $last_error",
        'hint' => 'Visit https://rkenterprisess.net/api/diag to inspect the backend process state.'
    ]);
}
