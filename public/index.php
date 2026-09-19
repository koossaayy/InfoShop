<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// PHP 8.5 deprecates the PDO::MYSQL_ATTR_* constants that Laravel's database
// config files still use. Config is loaded before the framework registers its
// error handler, so PHP would print those notices straight into the response
// and corrupt JSON/Inertia payloads. Silence deprecations for that window only;
// HandleExceptions restores full error reporting once the app is booted.
error_reporting(error_reporting() & ~E_DEPRECATED);

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());
