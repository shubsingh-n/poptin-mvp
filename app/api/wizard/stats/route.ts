import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Site from '@/models/Site';
import Popup from '@/models/Popup';
import Lead from '@/models/Lead';
import Event from '@/models/Event';
import Subscriber from '@/models/Subscriber';
import NotificationCampaign from '@/models/NotificationCampaign';

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
            totalSubscribers,
            totalCampaigns,
            campaignsBatch,
            users
        ] = await Promise.all([
            User.countDocuments(),
            Site.countDocuments(),
            Popup.countDocuments(),
            Lead.countDocuments(),
            Event.countDocuments(),
            Subscriber.countDocuments(),
            NotificationCampaign.countDocuments(),
            NotificationCampaign.find(),
            User.find().select('-password').sort({ createdAt: -1 }).lean()
        ]);

        const totalSentNotifications = campaignsBatch.reduce((acc: number, c: any) => acc + (c.sentCount || 0), 0);

        // Aggregate stats per user
        const [sitesByUser, popupsByUser, leadsByUser, subscribersByUser, campaignsByUser, notificationsSentByUser] = await Promise.all([
            Site.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
            Popup.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
            Lead.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
            // Subscriber count per user (joining with Site)
            Subscriber.aggregate([
                {
                    $lookup: {
                        from: 'sites',
                        localField: 'siteId',
                        foreignField: 'siteId',
                        as: 'site'
                    }
                },
                { $unwind: '$site' },
                { $group: { _id: '$site.userId', count: { $sum: 1 } } }
            ]),
            NotificationCampaign.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]),
            NotificationCampaign.aggregate([{ $group: { _id: '$userId', sentCount: { $sum: '$sentCount' } } }])
        ]);

        const usersWithStats = users.map((u: any) => {
            const siteCount = sitesByUser.find(s => s._id?.toString() === u._id.toString())?.count || 0;
            const popupCount = popupsByUser.find(p => p._id?.toString() === u._id.toString())?.count || 0;
            const leadCount = leadsByUser.find(l => l._id?.toString() === u._id.toString())?.count || 0;
            const campaignCount = campaignsByUser.find(c => c._id?.toString() === u._id.toString())?.count || 0;
            const subscriberCount = subscribersByUser.find(s => s._id?.toString() === u._id.toString())?.count || 0;
            const sentCount = notificationsSentByUser.find(n => n._id?.toString() === u._id.toString())?.sentCount || 0;

            return {
                ...u,
                stats: {
                    sites: siteCount,
                    popups: popupCount,
                    leads: leadCount,
                    campaigns: campaignCount,
                    subscribers: subscriberCount,
                    sentNotifications: sentCount
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
                totalEvents,
                totalSubscribers,
                totalCampaigns,
                totalSentNotifications
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
