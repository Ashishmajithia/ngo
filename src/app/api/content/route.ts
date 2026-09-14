import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { defaultContent } from '@/data/initialContent';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json({ success: true, data: db.content || defaultContent });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    db.content = { ...db.content, ...body };
    db.updatedAt = new Date().toISOString();

    saveDb(db);
    return NextResponse.json({ success: true, data: db.content, message: 'Content saved to database successfully!' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
