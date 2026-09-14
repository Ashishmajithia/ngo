import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { defaultContent } from '@/data/initialContent';

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
    const content = db.content || defaultContent;
    const contentWithTimestamp = {
      ...content,
      updatedAt: content.updatedAt || db.updatedAt || new Date().toISOString(),
    };
    return NextResponse.json(
      { success: true, data: contentWithTimestamp },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

    const timestamp = body.updatedAt || new Date().toISOString();
    db.content = { ...db.content, ...body, updatedAt: timestamp };
    db.updatedAt = timestamp;

    saveDb(db);
    return NextResponse.json(
      { success: true, data: db.content, message: 'Content saved to database successfully!' },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
