import { adminFirestore } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export interface LogEntry {
    adminId: string;
    adminEmail: string;
    action: string;
    targetId?: string | null;
    targetName?: string | null; // Human readable name of the resource
    targetType: string;
    details: string;
    metadata?: any;
    timestamp: Timestamp;
}

export async function logAdminAction(
    adminId: string,
    adminEmail: string,
    action: string,
    targetType: string,
    details: string,
    targetId?: string,
    targetName?: string,
    metadata?: any
) {
    const logData: LogEntry = {
        adminId,
        adminEmail,
        action,
        targetType,
        targetId: targetId || null,
        targetName: targetName || null,
        details,
        metadata: metadata || null,
        timestamp: Timestamp.now(),
    };

    try {
        await adminFirestore.collection("activity_logs").add(logData);
        console.log(`[Admin Log] ${action} on ${targetType}: ${details}`);
    } catch (error) {
        console.error("Failed to write admin log:", error);
        throw error; // Propagate error to API handler
    }
}
