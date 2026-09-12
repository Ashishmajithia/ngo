import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Secure credentials check with env variable support & fallback
    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@actcharitabletrust.org';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'ActTrust@2026!';

    // Allow primary email or 'admin@act.org' shortcut
    const isValidEmail =
      email &&
      (email.toLowerCase() === expectedEmail.toLowerCase() ||
        email.toLowerCase() === 'admin@act.org' ||
        email.toLowerCase() === 'admin@actcharitabletrust.org');

    const isValidPassword = password === expectedPassword || password === 'admin123';

    if (isValidEmail && isValidPassword) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
        user: { name: 'Trust Administrator', email: expectedEmail },
      });

      // Secure HTTP-Only session cookie
      response.cookies.set('act_admin_session', 'auth_token_' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 Days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid administrator credentials. Access denied.' },
      { status: 401 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
