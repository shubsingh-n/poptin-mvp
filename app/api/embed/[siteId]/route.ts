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
  const { searchParams } = new URL(request.url);
  const lastVariantId = searchParams.get('lastVariantId');

  try {
    await connectDB();

    // Fetch ALL active popups for this site
    const activePopups = await Popup.find({
      siteId: params.siteId,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!activePopups || activePopups.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No active popup found for this site' },
        { status: 404, headers: corsHeaders }
      );
    }

    let selectedPopup = activePopups[0]; // Default to most recent

    // A/B Testing Logic
    // If the most recent active popup belongs to a test group, we handle variant cycling
    if (selectedPopup.testGroupId) {
      const variants = activePopups
        .filter(p => p.testGroupId === selectedPopup.testGroupId)
        .sort((a, b) => (a.variantLabel || '').localeCompare(b.variantLabel || ''));

      if (variants.length > 1) {
        let nextIndex = 0;
        if (lastVariantId) {
          const currentIndex = variants.findIndex(v => v._id.toString() === lastVariantId);
          if (currentIndex !== -1) {
            nextIndex = (currentIndex + 1) % variants.length;
          }
        }
        selectedPopup = variants[nextIndex];
        console.log(`[ABtest] Site ${params.siteId}: Last was ${lastVariantId}, serving ${selectedPopup._id} (${selectedPopup.variantLabel})`);
      }
    }

    // Return only the data needed for the embed script
    return NextResponse.json(
      {
        success: true,
        data: {
          popupId: selectedPopup._id.toString(),
          testGroupId: selectedPopup.testGroupId,
          variantLabel: selectedPopup.variantLabel,
          // Legacy
          title: selectedPopup.title,
          description: selectedPopup.description,
          ctaText: selectedPopup.ctaText,
          styles: selectedPopup.styles,
          // New
          components: selectedPopup.components,
          settings: selectedPopup.settings,
          triggers: selectedPopup.triggers,
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

