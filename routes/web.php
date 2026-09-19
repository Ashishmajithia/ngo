<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ContentController;
use App\Models\Blog;

/*
|--------------------------------------------------------------------------
| Web Routes - SPA React Fallback with High-Speed Server Caching
|--------------------------------------------------------------------------
*/

Route::get('/{any?}', function () {
    $serverContent = null;
    $serverBlogs = null;

    try {
        $serverContent = ContentController::getContentArray();
    } catch (\Throwable $e) {}

    try {
        $serverBlogs = Blog::active()->ordered()->get()->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'excerpt' => $b->excerpt,
                'content' => $b->content,
                'thumbnail' => $b->thumbnail,
                'coverImage' => $b->cover_image,
                'images' => is_array($b->images) ? $b->images : (json_decode($b->images, true) ?: []),
                'author' => $b->author,
                'category' => $b->category,
                'published' => (bool)$b->published,
                'date' => $b->published_at ? $b->published_at->format('F d, Y') : $b->created_at->format('F d, Y'),
            ];
        })->values();
    } catch (\Throwable $e) {}

    return response()
        ->view('app', [
            'serverContent' => $serverContent,
            'serverBlogs' => $serverBlogs,
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
})->where('any', '^(?!api|uploads).*$');
