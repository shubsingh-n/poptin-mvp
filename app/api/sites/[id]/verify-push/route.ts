import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Site from '@/models/Site';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const site = await Site.findOne({ _id: params.id, userId: (session.user as any).id });

        if (!site) {
            return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
        }

        // Verification Logic
        let domain = site.domain;
        if (!domain.startsWith('http')) domain = `https://${domain}`;
        const swUrl = `${domain.replace(/\/$/, '')}/firebase-messaging-sw.js`;

        try {
            const response = await fetch(swUrl, { cache: 'no-store' });
            if (!response.ok) {
                return NextResponse.json({
                    success: false,
                    error: `Could not reach ${swUrl}. Status: ${response.status}`
                });
            }

            const text = await response.text();

            // Simple validation: check for firebase init
            if (text.includes('firebase.initializeApp')) {
                site.isPushVerified = true;
                await site.save();
                return NextResponse.json({ success: true, message: 'Setup verified successfully!' });
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'File found but does not contain valid Firebase initialization code.'
                });
            }

        } catch (fetchError) {
            return NextResponse.json({
                success: false,
                error: `Failed to connect to ${swUrl}. Check your SSL or firewall.`
            });
        }

    } catch (error: any) {
        console.error('Error verifying push setup:', error);
        return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
    }
}
