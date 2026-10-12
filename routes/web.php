<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - SPA React Fallback with High-Speed Server Caching
|--------------------------------------------------------------------------
*/

Route::get('/google56250d811f255f09.html', function () {
    return response("google-site-verification: google56250d811f255f09.html\n", 200)
        ->header('Content-Type', 'text/html');
});

Route::get('/sitemap.xml', function () {
    $path = public_path('sitemap.xml');
    if (file_exists($path)) {
        return response(file_get_contents($path), 200)->header('Content-Type', 'application/xml');
    }
    return abort(404);
});

Route::get('/{any?}', function () {
    return response()
        ->view('app')
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
})->where('any', '^(?!api|uploads).*$');

