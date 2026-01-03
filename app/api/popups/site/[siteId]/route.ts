import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Popup from '@/models/Popup';

/**
 * GET /api/popups/site/[siteId]
 * Fetch all popups for a specific site
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const popups = await Popup.find({
      siteId: params.siteId,
      userId: (session.user as any).id
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, data: popups }, { status: 200 });
  } catch (error) {
    console.error('Error fetching popups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popups' },
      { status: 500 }
    );
  }
}

