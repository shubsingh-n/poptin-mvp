import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import Event from '@/models/Event';
import Popup from '@/models/Popup';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Handle OPTIONS request for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/leads
 * Fetch all leads with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get('siteId');
    const popupId = searchParams.get('popupId');

    const query: any = {};
    if (siteId) query.siteId = siteId;
    if (popupId) query.popupId = popupId;

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: leads }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/leads
 * Create a new lead (email submission)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    console.log('[Leads-API] Received body:', JSON.stringify(body));
    const { siteId, popupId, email, data, leadId } = body;

    if (!siteId || !popupId) {
      return NextResponse.json(
        { success: false, error: 'Site ID and popup ID are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const emailToSave = email || data?.email || data?.Email || '';

    // Basic email validation if provided
    if (emailToSave) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailToSave !== 'anonymous@upload' && !emailRegex.test(emailToSave)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    let lead;
    try {
      if (leadId) {
        console.log('[Leads-API] Updating lead:', leadId);
        lead = await Lead.findById(leadId);
        if (lead) {
          if (emailToSave) lead.email = emailToSave;
          if (data) {
            lead.data = { ...(lead.data || {}), ...data };
            lead.markModified('data');
          }
          await lead.save();
        } else {
          lead = await Lead.create({ siteId, popupId, email: emailToSave, data });
        }
      } else {
        console.log('[Leads-API] Creating new lead');
        lead = await Lead.create({ siteId, popupId, email: emailToSave, data });
      }
    } catch (dbErr: any) {
      console.error('[Leads-API] DB Error (Lead Operation):', dbErr);
      return NextResponse.json({ success: false, error: 'DB error during lead creation', message: dbErr.message }, { status: 500, headers: corsHeaders });
    }

    if (!leadId) {
      try {
        console.log('[Leads-API] Creating Event');
        await Event.create({
          siteId,
          popupId,
          type: 'conversion',
        });
      } catch (evtErr: any) {
        console.error('[Leads-API] DB Error (Event Creation):', evtErr);
        // We don't necessarily want to fail the whole request if event fails, 
        // but let's see if this is causing the 500.
      }

      try {
        console.log('[Leads-API] Incrementing Stats');
        await Popup.findByIdAndUpdate(popupId, { $inc: { 'stats.submissions': 1 } });
      } catch (statsErr: any) {
        console.error('[Leads-API] DB Error (Stats Increment):', statsErr);
      }
    }

    return NextResponse.json({ success: true, data: lead }, { status: leadId ? 200 : 201, headers: corsHeaders });
  } catch (error: any) {
    console.error('[Leads-API] Global Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process lead', message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

