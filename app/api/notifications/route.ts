import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import NotificationCampaign from '@/models/NotificationCampaign';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session as any).user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const siteId = searchParams.get('siteId');

        const query: any = { userId: (session.user as any).id };
        if (siteId) query.siteId = siteId;

        const campaigns = await NotificationCampaign.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: campaigns });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();

        const campaign = await NotificationCampaign.create({
            ...body,
            userId: (session.user as any).id,
        });

        return NextResponse.json({ success: true, data: campaign });
    } catch (error) {
        console.error('Error creating campaign:', error);
        return NextResponse.json({ success: false, error: 'Failed to create campaign' }, { status: 500 });
    }
}
