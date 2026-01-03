import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the wizard token cookie
    response.cookies.set('wizard_token', '', {
        httpOnly: true,
        expires: new Date(0),
        path: '/',
    });

    return response;
}
