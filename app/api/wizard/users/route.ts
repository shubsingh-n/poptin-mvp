import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(request: NextRequest) {
    const token = request.cookies.get('wizard_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret');
    } catch (e) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        await connectDB();
        const { userId, action } = await request.json();

        if (!userId || !['block', 'unblock'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
        }

        const isBlocked = action === 'block';
        const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: any) {
        console.error('Wizard User Update Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
