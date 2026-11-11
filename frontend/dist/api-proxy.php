<?php
/**
 * Myth Connect.ai - Hostinger LiteSpeed API Reverse Proxy
 * Bridges web requests to internal Node.js backend on port 5050
 */

$backend_host = 'http://127.0.0.1:5050';

// Determine the API subpath
$path = isset($_GET['__path']) ? $_GET['__path'] : '';
$query = $_SERVER['QUERY_STRING'] ?? '';

// Strip __path from query string
$query_parts = [];
parse_str($query, $query_parts);
unset($query_parts['__path']);
$clean_query = http_build_query($query_parts);

$target_url = $backend_host . '/api' . ($path ? '/' . ltrim($path, '/') : '') . ($clean_query ? '?' . $clean_query : '');

$ch = curl_init($target_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);

// Forward headers
$headers = [];
$incoming_headers = function_exists('getallheaders') ? getallheaders() : [];
foreach ($incoming_headers as $name => $value) {
    $lower = strtolower($name);
    if ($lower !== 'host' && $lower !== 'content-length') {
        $headers[] = "$name: $value";
    }
}

// Forward request body
$method = $_SERVER['REQUEST_METHOD'];
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    $body = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $headers[] = 'Content-Length: ' . strlen($body);
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'BackendUnavailable',
        'message' => 'Unable to connect to Node.js backend on port 5050: ' . curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$res_headers = substr($response, 0, $header_size);
$res_body = substr($response, $header_size);

curl_close($ch);

http_response_code($status_code);

foreach (explode("\r\n", $res_headers) as $hdr) {
    if ($hdr && !preg_match('/^(Transfer-Encoding|Connection):/i', $hdr)) {
        header($hdr, false);
    }
}

echo $res_body;
