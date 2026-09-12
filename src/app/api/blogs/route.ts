import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { defaultBlogs } from '@/data/initialBlogs';
import { BlogPost } from '@/types/blog';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ content: null, donations: [], blogs: defaultBlogs }, null, 2),
      'utf-8'
    );
  }
}

function readDb() {
  ensureDbExists();
  const dataStr = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(dataStr);
  if (!db.blogs || !Array.isArray(db.blogs) || db.blogs.length === 0) {
    db.blogs = defaultBlogs;
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  }
  return db;
}

export async function GET() {
  try {
    const db = readDb();
    return NextResponse.json({ success: true, blogs: db.blogs });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();

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
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

    return NextResponse.json({ success: true, blog: newBlog, message: 'Blog post created successfully!' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = readDb();

    const index = db.blogs.findIndex((b: BlogPost) => b.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Blog not found' }, { status: 404 });
    }

    db.blogs[index] = {
      ...db.blogs[index],
      ...body,
      slug: body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : db.blogs[index].slug,
    };

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return NextResponse.json({ success: true, blog: db.blogs[index], message: 'Blog post updated!' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing blog ID' }, { status: 400 });
    }

    const db = readDb();
    db.blogs = db.blogs.filter((b: BlogPost) => b.id !== id);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Blog deleted successfully!' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
