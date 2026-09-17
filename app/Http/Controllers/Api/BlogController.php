<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Blog;

class BlogController extends Controller
{
    public function index()
    {
        $blogs = Blog::orderBy('created_at', 'desc')->get();

        $formatted = $blogs->map(function ($b) {
            return [
                'id' => $b->id,
                'title' => $b->title,
                'slug' => $b->slug,
                'excerpt' => $b->excerpt ?? '',
                'content' => $b->content ?? '',
                'coverImage' => $b->cover_image ?? '',
                'images' => $b->images ?? [],
                'author' => $b->author ?? 'ACT Trust Team',
                'category' => $b->category ?? 'Education',
                'published' => (bool)$b->published,
                'date' => $b->date ?? $b->created_at->format('F d, Y'),
                'created_by' => $b->created_by ?? 'admin@actcharitabletrust.org',
            ];
        });

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
        ]);
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

        $blog = Blog::create([
            'id' => $id,
            'title' => $title,
            'slug' => $slug,
            'excerpt' => $request->excerpt ?? '',
            'content' => $request->content ?? '',
            'cover_image' => $request->coverImage ?? 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
            'images' => $request->images ?? [],
            'author' => $request->author ?? 'ACT Trust Team',
            'category' => $request->category ?? 'Education',
            'published' => $request->has('published') ? (bool)$request->published : true,
            'date' => $request->date ?? now()->format('F d, Y'),
            'created_by' => $createdBy,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Blog post created successfully in Supabase database!',
            'blog' => $blog,
        ]);
    }

    public function update(Request $request, $id)
    {
        $blog = Blog::findOrFail($id);

        $data = $request->all();
        if (!empty($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        if (isset($data['coverImage'])) {
            $data['cover_image'] = $data['coverImage'];
        }

        $blog->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Blog post updated successfully!',
            'blog' => $blog,
        ]);
    }

    public function destroy($id)
    {
        $blog = Blog::find($id);
        if ($blog) {
            $blog->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Blog post deleted successfully from Supabase database!',
        ]);
    }
}
