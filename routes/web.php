<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - SPA React Fallback with High-Speed Server Caching
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    $initialContent = null;
    try {
        $initialContent = \App\Http\Controllers\Api\ContentController::getContentArray();
    } catch (\Throwable $e) {
        // Fallback gracefully if database connection is temporarily slow
    }
    return response()
        ->view('app', compact('initialContent'))
        ->header('Cache-Control', 'public, max-age=0, s-maxage=120, stale-while-revalidate=86400');
})->where('any', '^(?!api|uploads).*$');
