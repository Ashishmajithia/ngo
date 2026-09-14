import { NextResponse } from 'next/server';
import { BlogPost } from '@/types/blog';
import { getDb, saveDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json({ success: true, blogs: db.blogs }, { headers: NO_CACHE_HEADERS });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    const newBlog: BlogPost = {
      id: 'blog-' + Date.now(),
      title: body.title,
      slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: body.excerpt || '',
      content: body.content || '',
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop',
      images: Array.isArray(body.images) && body.images.length > 0 
        ? body.images 
        : [body.coverImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop'],
      author: body.author || 'ACT Trust Team',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      category: body.category || 'Education',
      published: body.published !== undefined ? body.published : true,
    };

    db.blogs.unshift(newBlog);
    saveDb(db);

    return NextResponse.json({ success: true, blog: newBlog, message: 'Blog post created successfully!' }, { headers: NO_CACHE_HEADERS });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    const index = db.blogs.findIndex((b: BlogPost) => b.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    db.blogs[index] = {
      ...db.blogs[index],
      ...body,
      slug: body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : db.blogs[index].slug,
    };

    saveDb(db);
    return NextResponse.json({ success: true, blog: db.blogs[index], message: 'Blog post updated!' }, { headers: NO_CACHE_HEADERS });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing blog ID' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const db = getDb();
    db.blogs = db.blogs.filter((b: BlogPost) => b.id !== id);
    saveDb(db);

    return NextResponse.json({ success: true, message: 'Blog deleted successfully!' }, { headers: NO_CACHE_HEADERS });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
