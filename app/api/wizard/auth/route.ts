import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const WIZARD_EMAIL = process.env.WIZARD_EMAIL;
        const WIZARD_PASSWORD = process.env.WIZARD_PASSWORD;

        if (!WIZARD_EMAIL || !WIZARD_PASSWORD) {
            return NextResponse.json(
                { success: false, error: 'Wizard credentials not configured' },
                { status: 500 }
            );
        }

        if (email !== WIZARD_EMAIL || password !== WIZARD_PASSWORD) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Create a special wizard token
        const token = jwt.sign(
            { role: 'wizard', email },
            process.env.NEXTAUTH_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        const response = NextResponse.json({ success: true });

        // Set cookie
        response.cookies.set('wizard_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
