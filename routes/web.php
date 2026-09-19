<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - SPA React Fallback with High-Speed Server Caching
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    $initialContent = null;
    $initialBlogs = null;
    try {
        $initialContent = \App\Http\Controllers\Api\ContentController::getContentArray();
    } catch (\Throwable $e) {
        // Fallback gracefully if database connection is temporarily slow
    }
    try {
        $initialBlogs = \App\Http\Controllers\Api\BlogController::getBlogsArray();
    } catch (\Throwable $e) {
        // Fallback gracefully
    }
    return response()
        ->view('app', compact('initialContent', 'initialBlogs'))
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
})->where('any', '^(?!api|uploads).*$');
