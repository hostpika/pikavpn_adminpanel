import { NextResponse } from "next/server";
import { adminAuth, adminFirestore, adminMessaging } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function GET(request: Request) {
    try {
        const snapshot = await adminFirestore.collection("notifications").orderBy("sentAt", "desc").get();
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sentAt: doc.data().sentAt?.toDate().toLocaleString() || "",
        }));

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { title, message, target, scheduleDate, scheduleTime } = await request.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
        }

        // Determine target topic
        let condition = "";
        let topic = "";

        switch (target) {
            case "all":
                topic = "all";
                break;
            case "premium":
                topic = "premium";
                break;
            case "free":
                topic = "free";
                break;
            default:
                // For 'specific', we might need individual tokens which isn't implemented in this simple UI yet
                // defaulting to 'all' for safety or throwing error
                topic = "all";
        }

        // Construct FCM message
        const fcmMessage = {
            notification: {
                title,
                body: message,
            },
            topic: topic,
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                target: target
            }
        };

        let messageId = "";
        let status = "sent";

        // If scheduled (not implemented in FCM directly easily without external scheduler, 
        // but we can save as 'scheduled' in DB and have a cron job pick it up. 
        // For this MVP, we will only send immediate if no schedule is provided, 
        // or just mark as 'scheduled' in DB without sending if date provided.)

        if (!scheduleDate) {
            // Send immediately
            messageId = await adminMessaging.send(fcmMessage);
        } else {
            status = "scheduled";
            // Logic for actual scheduling would go here (e.g. Cloud Scheduler or Task Queue)
            // For now we just save it as scheduled.
        }

        // Save to Firestore
        const notificationRecord = {
            title,
            message,
            target,
            status,
            // Create a date object from schedule or now
            sentAt: scheduleDate ? Timestamp.fromDate(new Date(`${scheduleDate} ${scheduleTime}`)) : Timestamp.now(),
            recipients: 0, // Placeholder, hard to know exact count without analytics
            delivered: 0,
            opened: 0,
            fcmMessageId: messageId || null,
            createdAt: Timestamp.now(),
        };

        const docRef = await adminFirestore.collection("notifications").add(notificationRecord);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            messageId
        });

    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
