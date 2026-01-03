import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import NotificationCampaign from '@/models/NotificationCampaign';
import Subscriber from '@/models/Subscriber';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already
if (!admin.apps.length) {
    try {
        const serviceAccountStr = process.env.FCM_SERVICE_ACCOUNT;
        if (serviceAccountStr) {
            const serviceAccount = JSON.parse(serviceAccountStr);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin Initialized Successfully');
        } else {
            console.error('FCM_SERVICE_ACCOUNT not found in environment');
        }
    } catch (e) {
        console.error('Firebase Admin Init Error:', e);
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session as any).user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = params;

        const campaign = await NotificationCampaign.findOne({
            _id: id,
            userId: (session.user as any).id
        });

        if (!campaign) {
            return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
        }

        if (campaign.status === 'sent') {
            return NextResponse.json({ success: false, error: 'Campaign already sent' }, { status: 400 });
        }

        // 1. Fetch Subscribers
        const subscribers = await Subscriber.find({ siteId: campaign.siteId });
        const tokens = subscribers.map(s => s.token);

        if (tokens.length === 0) {
            return NextResponse.json({ success: false, error: 'No subscribers found for this site.' }, { status: 400 });
        }

        // 2. Prepare Payload and Send
        let successCount = 0;
        let failureCount = 0;

        if (admin.apps.length > 0) {
            const message = {
                notification: {
                    title: campaign.title,
                    body: campaign.body,
                },
                webpush: {
                    headers: {
                        Urgency: 'high',
                    },
                    notification: {
                        title: campaign.title,
                        body: campaign.body,
                        icon: campaign.icon || '/icon.png',
                        image: campaign.image,
                        requireInteraction: true,
                    },
                    fcmOptions: {
                        link: campaign.link || '/'
                    }
                },
                tokens: tokens,
            };

            const response = await admin.messaging().sendEachForMulticast(message as any);
            successCount = response.successCount;
            failureCount = response.failureCount;

            console.log(`Successfully sent ${successCount} messages; ${failureCount} failed.`);
        } else {
            throw new Error('Firebase Admin not initialized');
        }

        // 3. Update Campaign
        campaign.status = 'sent';
        campaign.sentCount = successCount;
        campaign.failureCount = failureCount;
        await campaign.save();

        return NextResponse.json({ success: true, data: campaign });

    } catch (error: any) {
        console.error('Error sending campaign:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to send campaign' }, { status: 500 });
    }
}
