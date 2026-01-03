import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: NextRequest) {
    console.log('[Debug-Auth] Request Headers:', Object.fromEntries(request.headers));

    // Explicitly check for cookie presence manually for debugging
    const cookieToken = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
    console.log('[Debug-Auth] Raw Cookie Token:', cookieToken?.value ? 'Present (Hidden)' : 'Missing');

    try {
        const session = await getServerSession(authOptions);
        console.log('[Debug-Auth] Session Result:', session ? 'Found User: ' + session.user?.email : 'NULL');

        return NextResponse.json({
            success: true,
            sessionStatus: session ? 'Authenticated' : 'Unauthenticated',
            user: session?.user || null,
            envSecretSet: !!process.env.NEXTAUTH_SECRET,
            cookiesReceived: request.cookies.getAll().map(c => c.name)
        });
    } catch (error: any) {
        console.error('[Debug-Auth] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
