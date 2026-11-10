<?php

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// If the requested URI points to an actual file, let PHP's built-in server serve it directly.
if ($uri !== '/' && is_file(__DIR__.'/public'.$uri)) {
    return false;
}

// Normalize SCRIPT_NAME and PHP_SELF so Laravel's router computes the correct path (e.g. /dashboard/automation)
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF']    = '/index.php';
unset($_SERVER['PATH_INFO']);

require_once __DIR__.'/public/index.php';
