<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - SPA React Fallback
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api|uploads).*$');
