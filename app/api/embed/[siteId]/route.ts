import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Popup from '@/models/Popup';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/embed/[siteId]
 * Fetch active popup configuration for embed script
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    await connectDB();
    const popup = await Popup.findOne({
      siteId: params.siteId,
      isActive: true,
    }).sort({ createdAt: -1 }); // Get the most recent active popup

    if (!popup) {
      return NextResponse.json(
        { success: false, error: 'No active popup found for this site' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Return only the data needed for the embed script
    return NextResponse.json(
      {
        success: true,
        data: {
          popupId: popup._id.toString(),
          title: popup.title,
          description: popup.description,
          ctaText: popup.ctaText,
          styles: popup.styles,
          triggers: popup.triggers,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching embed config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch embed config' },
      { status: 500, headers: corsHeaders }
    );
  }
}

