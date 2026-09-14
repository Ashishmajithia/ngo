import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json({ success: true, donations: db.donations || [] });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
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
