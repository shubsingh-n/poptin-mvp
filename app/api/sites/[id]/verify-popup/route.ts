import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/mongodb';
import Site from '@/models/Site';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const site = await Site.findOne({ _id: params.id, userId: (session.user as any).id });

        if (!site) {
            return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
        }

        // Verification Logic
        let domain = site.domain;
        if (!domain.startsWith('http')) domain = `https://${domain}`;

        try {
            const response = await fetch(domain, { cache: 'no-store' });
            if (!response.ok) {
                return NextResponse.json({
                    success: false,
                    error: `Could not reach ${domain}. Status: ${response.status}`
                });
            }

            const text = await response.text();

            // Validation: check for the script and siteId
            const scriptTag = `data-site-id="${site.siteId}"`;
            if (text.includes('popup.js') && text.includes(scriptTag)) {
                site.isPopupVerified = true;
                await site.save();
                return NextResponse.json({ success: true, message: 'Popup setup verified successfully!' });
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Embed script not found on the page. Please check the installation.'
                });
            }

        } catch (fetchError) {
            return NextResponse.json({
                success: false,
                error: `Failed to connect to ${domain}. Check your SSL or firewall.`
            });
        }

    } catch (error: any) {
        console.error('Error verifying popup setup:', error);
        return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
    }
}
