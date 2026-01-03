
import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationCampaign extends Document {
    userId: mongoose.Types.ObjectId;
    siteId: string;
    title: string;
    body: string;
    icon?: string;
    link?: string;
    image?: string;
    scheduledAt?: Date;
    status: 'draft' | 'scheduled' | 'sent' | 'failed';
    sentCount: number;
    failureCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationCampaignSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        siteId: {
            type: String,
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            default: '/icon.png',
        },
        link: {
            type: String,
        },
        image: {
            type: String,
        },
        scheduledAt: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['draft', 'scheduled', 'sent', 'failed'],
            default: 'draft',
        },
        sentCount: {
            type: Number,
            default: 0,
        },
        failureCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.NotificationCampaign || mongoose.model<INotificationCampaign>('NotificationCampaign', NotificationCampaignSchema);
