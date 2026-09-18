<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Blog;

class BlogController extends Controller
{
    public static function clearBlogCache()
    {
        @unlink('/tmp/blogs_cache.json');
        @unlink('/tmp/site_content_cache.json');
        $files = @glob('/tmp/blog_show_*.json');
        if ($files) {
            foreach ($files as $f) @unlink($f);
        }
    }

    private static function optimizeBase64Image($dataUrl, $maxWidth = 1200, $maxHeight = 800, $quality = 80)
    {
        if (!is_string($dataUrl) || !str_starts_with($dataUrl, 'data:image/')) {
            return $dataUrl;
        }
        if (strlen($dataUrl) < 150000) {
            return $dataUrl;
        }
        try {
            $commaPos = strpos($dataUrl, ',');
            if ($commaPos === false) return $dataUrl;
            $binary = base64_decode(substr($dataUrl, $commaPos + 1));
            if (!$binary) return $dataUrl;

            if (function_exists('imagecreatefromstring')) {
                $img = @imagecreatefromstring($binary);
                if ($img !== false) {
                    $origW = imagesx($img);
                    $origH = imagesy($img);
                    $scale = min(1.0, $maxWidth / max($origW, 1), $maxHeight / max($origH, 1));
                    $newW = max(1, (int)($origW * $scale));
                    $newH = max(1, (int)($origH * $scale));

                    $resized = imagecreatetruecolor($newW, $newH);
                    imagecopyresampled($resized, $img, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

                    ob_start();
                    imagejpeg($resized, null, $quality);
                    $compressedBinary = ob_get_clean();
                    imagedestroy($img);
                    imagedestroy($resized);

                    if ($compressedBinary && strlen($compressedBinary) < strlen($binary)) {
                        return 'data:image/jpeg;base64,' . base64_encode($compressedBinary);
                    }
                }
            }
        } catch (\Throwable $e) {}
        return $dataUrl;
    }

    public static function getBlogsArray()
    {
        $cacheFile = '/tmp/blogs_cache.json';
        if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 300)) {
            $cached = @json_decode(@file_get_contents($cacheFile), true);
            if (!empty($cached) && is_array($cached)) {
                return $cached;
            }
        }

        $blogs = Blog::where('published', true)
            ->orderBy('created_at', 'desc')
            ->get();

        $formatted = $blogs->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'excerpt' => $b->excerpt ?? '',
                'content' => $b->content ?? '',
                'coverImage' => $b->cover_image ?? '',
                'images' => [],
                'author' => $b->author ?? 'ACT Trust Team',
                'category' => $b->category ?? 'Education',
                'published' => (bool)$b->published,
                'date' => $b->date ?? ($b->created_at ? $b->created_at->format('F d, Y') : now()->format('F d, Y')),
                'created_by' => $b->created_by ?? 'admin@actcharitabletrust.org',
            ];
        })->values()->toArray();

        @file_put_contents($cacheFile, json_encode($formatted));
        return $formatted;
    }

    public function index()
    {
        $formatted = self::getBlogsArray();

        return response()->json([
            'success' => true,
            'blogs' => $formatted,
            'source' => 'supabase_pgsql_db',
            'dbStatus' => [
                'provider' => 'supabase',
                'status' => 'connected',
                'database' => 'PostgreSQL (Supabase Cloud)',
                'host' => config('database.connections.pgsql.host'),
            ],
        ])->header('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
    }

    public function show($idOrSlug)
    {
        $cacheKey = '/tmp/blog_show_' . md5($idOrSlug) . '.json';
        if (file_exists($cacheKey) && (time() - filemtime($cacheKey) < 300)) {
            $cached = @json_decode(@file_get_contents($cacheKey), true);
            if (!empty($cached) && is_array($cached)) {
                return response()->json($cached)
                    ->header('Cache-Control', 'public, max-age=120, s-maxage=3600, stale-while-revalidate=86400');
            }
        }

        $blog = Blog::where('id', $idOrSlug)
            ->orWhere('slug', $idOrSlug)
            ->first();

        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog story not found',
            ], 404);
        }

        $formatted = [
            'id' => $blog->id,
            'title' => $blog->title,
            'slug' => $blog->slug,
            'excerpt' => $blog->excerpt ?? '',
            'content' => $blog->content ?? '',
            'coverImage' => $blog->cover_image ?? '',
            'images' => $blog->images ?? [],
            'author' => $blog->author ?? 'ACT Trust Team',
            'category' => $blog->category ?? 'Child Education',
            'published' => (bool)$blog->published,
            'date' => $blog->date ?? ($blog->created_at ? $blog->created_at->format('F d, Y') : now()->format('F d, Y')),
            'created_by' => $blog->created_by ?? 'admin@actcharitabletrust.org',
        ];

        // Also fetch related stories
        $related = Blog::where('id', '!=', $blog->id)
            ->where('published', true)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'excerpt' => $b->excerpt ?? '',
                    'coverImage' => $b->cover_image ?? '',
                    'category' => $b->category ?? 'Child Education',
                    'date' => $b->date ?? ($b->created_at ? $b->created_at->format('F d, Y') : now()->format('F d, Y')),
                ];
            });

        $payload = [
            'success' => true,
            'blog' => $formatted,
            'related' => $related,
            'source' => 'supabase_pgsql_db',
        ];

        @file_put_contents($cacheKey, json_encode($payload));

        return response()->json($payload)
            ->header('Cache-Control', 'public, max-age=120, s-maxage=3600, stale-while-revalidate=86400');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required',
        ]);

        $id = $request->id ?: 'blog-' . time();
        $title = $request->title;
        $slug = $request->slug ?: Str::slug($title);
        $createdBy = $request->created_by ?: (auth()->user()?->email ?? env('ADMIN_EMAIL', 'admin@actcharitabletrust.org'));

        $coverImage = $request->coverImage ?? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop';
        $coverImage = self::optimizeBase64Image($coverImage);

        $images = $request->images ?? [];
        if (is_array($images)) {
            $images = array_map(function ($img) {
                return self::optimizeBase64Image($img);
            }, $images);
        }

        $blog = Blog::create([
            'id' => $id,
            'title' => $title,
            'slug' => $slug,
            'excerpt' => $request->excerpt ?? '',
            'content' => $request->content ?? '',
            'cover_image' => $coverImage,
            'images' => $images,
            'author' => $request->author ?? 'ACT Trust Team',
            'category' => $request->category ?? 'Education',
            'published' => $request->has('published') ? (bool)$request->published : true,
            'date' => $request->date ?? now()->format('F d, Y'),
            'created_by' => $createdBy,
        ]);

        self::clearBlogCache();

        return response()->json([
            'success' => true,
            'message' => 'Blog post created successfully in Supabase database!',
            'blog' => $blog,
        ]);
    }

    public function update(Request $request, $id = null)
    {
        $targetId = $id ?: $request->input('id');
        if (!$targetId) {
            return response()->json([
                'success' => false,
                'message' => 'Blog ID is required for update',
            ], 400);
        }

        $blog = Blog::find($targetId);
        if (!$blog) {
            return response()->json([
                'success' => false,
                'message' => 'Blog story not found',
            ], 404);
        }

        $data = $request->all();
        if (!empty($data['title'])) {
            $data['slug'] = !empty($data['slug']) ? Str::slug($data['slug']) : Str::slug($data['title']);
        }
        if (isset($data['coverImage'])) {
            $data['cover_image'] = self::optimizeBase64Image($data['coverImage']);
        }
        if (isset($data['images']) && is_array($data['images'])) {
            $data['images'] = array_map(function ($img) {
                return self::optimizeBase64Image($img);
            }, $data['images']);
        }
        if (isset($data['published'])) {
            $data['published'] = (bool)$data['published'];
        }

        $blog->update($data);

        self::clearBlogCache();

        return response()->json([
            'success' => true,
            'message' => 'Blog post updated successfully!',
            'blog' => $blog,
        ]);
    }

    public function destroy(Request $request, $id = null)
    {
        $targetId = $id ?: $request->query('id') ?: $request->input('id');
        if (!$targetId) {
            return response()->json([
                'success' => false,
                'message' => 'Blog ID is required for deletion',
            ], 400);
        }

        $blog = Blog::find($targetId);
        if ($blog) {
            $blog->delete();
        }

        self::clearBlogCache();

        return response()->json([
            'success' => true,
            'message' => 'Blog post deleted successfully from Supabase database!',
        ]);
    }
}
