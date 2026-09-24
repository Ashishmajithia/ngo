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

    public static function generateThumbnail($dataUrl, $maxWidth = null, $maxHeight = null, $quality = null)
    {
        // Return 100% full resolution image without creating blurred low-res thumbnails
        return $dataUrl;
    }

    public static function optimizeBase64Image($dataUrl, $maxWidth = null, $maxHeight = null, $quality = null)
    {
        // Return 100% original full HD resolution without compression or downsampling
        return $dataUrl;
    }

    public static function getBlogsArray()
    {
        $blogs = Blog::where('published', true)
            ->select(['id', 'title', 'slug', 'excerpt', 'cover_image', 'author', 'category', 'published', 'date', 'created_at', 'created_by'])
            ->orderBy('created_at', 'desc')
            ->get();

        return $blogs->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'excerpt' => $b->excerpt ?? '',
                'thumbnail' => '',
                'coverImage' => $b->cover_image ?? '',
                'images' => [],
                'author' => $b->author ?? 'ACT Trust Team',
                'category' => $b->category ?? 'Education',
                'published' => (bool)$b->published,
                'date' => $b->date ?? ($b->created_at ? $b->created_at->format('F d, Y') : now()->format('F d, Y')),
                'created_by' => $b->created_by ?? 'admin@actcharitabletrust.org',
            ];
        })->values()->toArray();
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
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    public function show($idOrSlug)
    {
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
            'thumbnail' => '',
            'coverImage' => $blog->cover_image ?? '',
            'images' => $blog->images ?? [],
            'author' => $blog->author ?? 'ACT Trust Team',
            'category' => $blog->category ?? 'Child Education',
            'published' => (bool)$blog->published,
            'date' => $blog->date ?? ($blog->created_at ? $blog->created_at->format('F d, Y') : now()->format('F d, Y')),
            'created_by' => $blog->created_by ?? 'admin@actcharitabletrust.org',
        ];

        // Also fetch related stories (lightweight select without heavy images column)
        $related = Blog::where('id', '!=', $blog->id)
            ->where('published', true)
            ->select(['id', 'title', 'slug', 'excerpt', 'cover_image', 'category', 'date', 'created_at'])
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'title' => $b->title,
                    'slug' => $b->slug,
                    'excerpt' => $b->excerpt ?? '',
                    'thumbnail' => '',
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

        return response()->json($payload)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
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
