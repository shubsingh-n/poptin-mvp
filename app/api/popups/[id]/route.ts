import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Popup from '@/models/Popup';

/**
 * GET /api/popups/[id]
 * Fetch a single popup
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const popup = await Popup.findOne({ _id: params.id, userId: (session.user as any).id });

    if (!popup) {
      return NextResponse.json(
        { success: false, error: 'Popup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: popup }, { status: 200 });
  } catch (error) {
    console.error('Error fetching popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch popup' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/popups/[id]
 * Update a popup
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const popup = await Popup.findOneAndUpdate(
      { _id: params.id, userId: (session.user as any).id },
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!popup) {
      return NextResponse.json(
        { success: false, error: 'Popup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: popup }, { status: 200 });
  } catch (error) {
    console.error('Error updating popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update popup' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/popups/[id]
 * Delete a popup
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const popup = await Popup.findOneAndDelete({ _id: params.id, userId: (session.user as any).id });

    if (!popup) {
      return NextResponse.json(
        { success: false, error: 'Popup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: popup }, { status: 200 });
  } catch (error) {
    console.error('Error deleting popup:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete popup' },
      { status: 500 }
    );
  }
}

