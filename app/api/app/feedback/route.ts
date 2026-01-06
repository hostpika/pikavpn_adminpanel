import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/internal/firebase';
import { sendCustomEmail, getSmtpConfig } from '@/lib/email-service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, category, message, userId, platform, device, appVersion } = body;

        // Basic Validation
        if (!message || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const feedbackData = {
            type,
            category: category || 'General',
            message,
            userId: userId || 'anonymous',
            platform: platform || 'Unknown',
            device: device || 'Unknown',
            appVersion: appVersion || 'Unknown',
            status: 'new',
            createdAt: new Date(), // Firestore timestamp
        };

        // 1. Save to Firestore
        await adminDb.collection('feedback').add(feedbackData);

        // 2. Send Email Notification to Admin
        try {
            const config = await getSmtpConfig();
            if (config && config.fromEmail) {
                const subject = `[Pika VPN] New ${type === 'bug' ? 'Bug Report 🐞' : 'Feature Request 💡'} - ${category}`;
                const emailMessage = `
                    <strong>Type:</strong> ${type}<br>
                    <strong>Category:</strong> ${category}<br>
                    <strong>User ID:</strong> ${userId}<br>
                    <strong>Device:</strong> ${device} (${platform})<br>
                    <strong>App Version:</strong> ${appVersion}<br>
                    <hr>
                    <h3>Message:</h3>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                `;

                // Send to the admin (sender email)
                await sendCustomEmail(config.fromEmail, subject, emailMessage);
            }
        } catch (emailError) {
            console.error('Failed to send feedback notification email:', emailError);
            // Don't fail the request if email fails, just log it
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing feedback:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
