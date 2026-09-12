import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Default admin credentials (email can be admin@act.org or admin@actcharitabletrust.org)
    const validEmail = email && (email.toLowerCase().includes('admin') || email.toLowerCase().includes('act'));
    const validPassword = password === 'admin123' || password === 'admin';

    if (validEmail && validPassword) {
      const response = NextResponse.json({
        success: true,
        message: 'Admin authentication successful!',
        user: { name: 'Trust Administrator', email },
      });

      // Set cookie
      response.cookies.set('act_admin_session', 'authenticated_token_' + Date.now(), {
        httpOnly: false, // Accessible to client-side state
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin credentials. Hint: admin@act.org / admin123' },
      { status: 401 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
