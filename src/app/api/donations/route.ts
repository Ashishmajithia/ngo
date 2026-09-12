import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ content: null, donations: [], contacts: [] }, null, 2),
      'utf-8'
    );
  }
}

export async function GET() {
  try {
    ensureDbExists();
    const dataStr = fs.readFileSync(DB_PATH, 'utf-8');
    const db = JSON.parse(dataStr);
    return NextResponse.json({ success: true, donations: db.donations || [] });
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

    const newDonation = {
      id: 'don_' + Date.now(),
      amount: body.amount,
      frequency: body.frequency || 'once',
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      createdAt: new Date().toISOString(),
    };

    db.donations = db.donations || [];
    db.donations.push(newDonation);

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      donation: newDonation,
      message: 'Donation recorded in database successfully!',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
