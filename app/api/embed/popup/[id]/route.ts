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
 * GET /api/embed/popup/[id]
 * Fetch a specific popup configuration for embed script (even if inactive/chained)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const popup = await Popup.findById(params.id);

        if (!popup) {
            return NextResponse.json(
                { success: false, error: 'Popup not found' },
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
                    components: popup.components,
                    settings: popup.settings,
                    triggers: popup.triggers,
                },
            },
            { status: 200, headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error fetching specific popup config:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch popup configuration' },
            { status: 500, headers: corsHeaders }
        );
    }
}
