import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { defaultContent } from '@/data/initialContent';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ content: defaultContent, donations: [], contacts: [] }, null, 2),
      'utf-8'
    );
  }
}

export async function GET() {
  try {
    ensureDbExists();
    const dataStr = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(dataStr);
    return NextResponse.json({ success: true, data: db.content || defaultContent });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    ensureDbExists();
    const body = await request.json();
    const dataStr = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(dataStr);

    db.content = { ...db.content, ...body };
    db.updatedAt = new Date().toISOString();

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: db.content, message: 'Content saved to database successfully!' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
