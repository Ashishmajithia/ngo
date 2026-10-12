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

Route::get('/{any?}', function ($any = null) {
    $baseUrl = 'https://act-charitable-trust.vercel.app';
    $seoTitle = 'ACT Charitable Trust | Rising Hope for Children (Reg. No. 220) - Official NGO';
    $seoDesc = 'ACT Charitable Trust (REG.NO.220) is an official non-profit organization dedicated to child education, daily nutrition, clothing drives, and vocational training in India. Donate to support underprivileged children.';
    $seoKeywords = 'ACT Charitable Trust, NGO, charity trust, child education NGO, donate for children, non profit organization Punjab, NGO Kharar Mohali, child healthcare charity, NGO 220, donation for kids, school kit donation, child nutrition NGO';
    $seoImage = $baseUrl . '/uploads/act_official_logo.jpg';
    $canonicalUrl = $baseUrl . ($any ? '/' . ltrim($any, '/') : '/');
    $ogType = 'website';

    // Route-specific SEO overrides
    if ($any && (str_starts_with($any, 'blogs') || $any === 'blogs')) {
        $seoTitle = 'Stories of Hope & Field Updates | ACT Charitable Trust (REG.NO.220)';
        $seoDesc = 'Explore real impact stories, distribution drives, and community milestones from ACT Charitable Trust field centers.';
    } elseif ($any && preg_match('#^(?:blog|blogs)/([^/]+)#', $any, $m)) {
        $slug = $m[1];
        $ogType = 'article';
        try {
            $blog = \App\Models\Blog::where('slug', $slug)->orWhere('id', $slug)->first();
            if ($blog) {
                $seoTitle = $blog->title . ' | ACT Charitable Trust (REG.NO.220)';
                if (!empty($blog->excerpt)) {
                    $seoDesc = \Illuminate\Support\Str::limit(strip_tags($blog->excerpt), 160);
                }
                if (!empty($blog->cover_image)) {
                    $seoImage = str_starts_with($blog->cover_image, 'http')
                        ? $blog->cover_image
                        : $baseUrl . $blog->cover_image;
                }
            }
        } catch (\Throwable $e) {
            // Safe fallback if database is loading
        }
    }

    return response()
        ->view('app', compact('seoTitle', 'seoDesc', 'seoKeywords', 'seoImage', 'canonicalUrl', 'ogType'))
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
})->where('any', '^(?!api|uploads).*$');

