<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - SPA React Fallback
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    $initialContent = null;
    try {
        $initialContent = \App\Http\Controllers\Api\ContentController::getContentArray();
    } catch (\Throwable $e) {
        // Fallback gracefully if database connection is temporarily slow
    }
    return view('app', compact('initialContent'));
})->where('any', '^(?!api|uploads).*$');
