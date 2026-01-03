import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Popup from '@/models/Popup';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const siteId = searchParams.get('siteId');

        if (!siteId) {
            return NextResponse.json({ success: false, error: 'siteId is required' }, { status: 400 });
        }

        await connectDB();

        // Fetch all popups for the site BELONGING TO THIS USER
        const popups = await Popup.find({ siteId, userId: (session.user as any).id }, '_id stats');

        const formattedStats: any = {};
        popups.forEach(popup => {
            formattedStats[popup._id.toString()] = {
                visitors: popup.stats?.visitors || 0,
                triggered: popup.stats?.views || 0,
                submitted: popup.stats?.submissions || 0,
            };
        });

        return NextResponse.json({ success: true, data: formattedStats });
    } catch (error: any) {
        console.error('Error fetching popup stats:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
