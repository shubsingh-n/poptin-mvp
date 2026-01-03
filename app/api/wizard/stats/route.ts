import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Site from '@/models/Site';
import Popup from '@/models/Popup';
import Lead from '@/models/Lead';
import Event from '@/models/Event';

export async function GET(request: NextRequest) {
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

        const [
            totalUsers,
            totalSites,
            totalPopups,
            totalLeads,
            totalEvents,
            users
        ] = await Promise.all([
            User.countDocuments(),
            Site.countDocuments(),
            Popup.countDocuments(),
            Lead.countDocuments(),
            Event.countDocuments(),
            User.find().select('-password').sort({ createdAt: -1 }).lean()
        ]);

        // Aggregate stats per user
        const [sitesByUser, popupsByUser, leadsByUser] = await Promise.all([
            Site.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
            Popup.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
            Lead.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }])
        ]);

        const usersWithStats = users.map((u: any) => {
            const siteCount = sitesByUser.find(s => s._id?.toString() === u._id.toString())?.count || 0;
            const popupCount = popupsByUser.find(p => p._id?.toString() === u._id.toString())?.count || 0;
            const leadCount = leadsByUser.find(l => l._id?.toString() === u._id.toString())?.count || 0;

            return {
                ...u,
                stats: {
                    sites: siteCount,
                    popups: popupCount,
                    leads: leadCount
                }
            };
        });

        return NextResponse.json({
            success: true,
            global: {
                totalUsers,
                totalSites,
                totalPopups,
                totalLeads,
                totalEvents
            },
            users: usersWithStats
        });
    } catch (error) {
        console.error('Wizard Stats Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
