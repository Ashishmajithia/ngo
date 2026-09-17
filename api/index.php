<?php

// Mark Vercel runtime
putenv('VERCEL=1');
$_ENV['VERCEL'] = '1';
$_SERVER['VERCEL'] = '1';

// Ensure /tmp writable paths exist on Vercel serverless environment
$storageDirs = [
    '/tmp/views',
    '/tmp/storage',
    '/tmp/storage/app',
    '/tmp/storage/app/public',
    '/tmp/storage/framework',
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
];

foreach ($storageDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
}

// Fallback environment variables for Vercel Serverless
$defaults = [
    'APP_NAME' => 'ACT Charitable Trust',
    'APP_ENV' => 'production',
    'APP_KEY' => 'base64:yyms/I4tyX47cPtyyT/lKsBYJ6xLW7JIEvGEJaTrP1o=',
    'APP_DEBUG' => 'true',
    'APP_URL' => 'https://act-charitable-trust.vercel.app',
    'DB_CONNECTION' => 'pgsql',
    'DB_HOST' => 'aws-0-ap-south-1.pooler.supabase.com',
    'DB_PORT' => '5432',
    'DB_DATABASE' => 'postgres',
    'DB_USERNAME' => 'postgres.outlizwvsgfrkuqmfhzl',
    'DB_PASSWORD' => 'vqpu1kyhDGKGWPeY',
    'DB_SSLMODE' => 'require',
    'SESSION_DRIVER' => 'cookie',
    'CACHE_DRIVER' => 'array',
    'LOG_CHANNEL' => 'stderr',
    'VIEW_COMPILED_PATH' => '/tmp/storage/framework/views',
];

foreach ($defaults as $key => $val) {
    if (empty(getenv($key)) && empty($_ENV[$key])) {
        putenv("{$key}={$val}");
        $_ENV[$key] = $val;
        $_SERVER[$key] = $val;
    }
}

// Forward to Laravel's index.php
require __DIR__ . '/../public/index.php';

