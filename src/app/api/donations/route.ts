import { NextResponse } from 'next/server';
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
    return NextResponse.json({ success: true, donations: db.donations || [] }, { headers: NO_CACHE_HEADERS });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = getDb();

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

    saveDb(db);

    return NextResponse.json(
      {
        success: true,
        donation: newDonation,
        message: 'Donation recorded in database successfully!',
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
