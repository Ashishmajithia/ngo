<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\SettingController;

/*
|--------------------------------------------------------------------------
| API Routes - Enterprise Relational Architecture
|--------------------------------------------------------------------------
*/

// Admin Authentication
Route::post('/admin/login', [AuthController::class, 'login']);
Route::get('/admin/verify', [AuthController::class, 'verify']);
Route::post('/admin/logout', [AuthController::class, 'logout']);

// Banners (Hero Carousel)
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/admin/banners', [BannerController::class, 'adminIndex']);
Route::post('/banners', [BannerController::class, 'store']);
Route::put('/banners/{id}', [BannerController::class, 'update']);
Route::delete('/banners/{id}', [BannerController::class, 'destroy']);
Route::post('/banners/reorder', [BannerController::class, 'reorder']);

// Programs
Route::get('/programs', [ProgramController::class, 'index']);
Route::get('/admin/programs', [ProgramController::class, 'adminIndex']);
Route::post('/programs', [ProgramController::class, 'store']);
Route::put('/programs/{id}', [ProgramController::class, 'update']);
Route::delete('/programs/{id}', [ProgramController::class, 'destroy']);

// Gallery Items
Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/admin/gallery', [GalleryController::class, 'adminIndex']);
Route::post('/gallery', [GalleryController::class, 'store']);
Route::put('/gallery/{id}', [GalleryController::class, 'update']);
Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);

// Settings (Brand, Payment, Support, Approach)
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/settings/{key}', [SettingController::class, 'show']);
Route::post('/settings', [SettingController::class, 'update']);

// Unified Content Aggregator (reads from relational tables for full backwards compatibility)
Route::get('/content', [ContentController::class, 'index']);
Route::post('/content', [ContentController::class, 'update']);

// Blogs CRUD
Route::get('/blogs', [BlogController::class, 'index']);
Route::post('/blogs', [BlogController::class, 'store']);
Route::put('/blogs/{id}', [BlogController::class, 'update']);
Route::delete('/blogs/{id}', [BlogController::class, 'destroy']);

// Donations
Route::get('/donations', [DonationController::class, 'index']);
Route::post('/donations', [DonationController::class, 'store']);
Route::patch('/donations/{id}', [DonationController::class, 'updateStatus']);

// Image Upload
Route::post('/upload', [UploadController::class, 'upload']);
