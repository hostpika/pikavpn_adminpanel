
import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth-helper";
import { verifySmtpConfig, SmtpConfig } from "@/lib/email-service";

export async function POST(request: Request) {
    try {
        const isAdmin = await getAdminFromRequest(request);
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { config, toEmail } = body;

        if (!config || !config.host || !config.port || !config.fromEmail) {
            return NextResponse.json({ error: "Invalid configuration. Host, Port, and From Email are required." }, { status: 400 });
        }

        // Ensure config matches the interface
        const smtpConfig: SmtpConfig = {
            host: config.host,
            port: Number(config.port),
            username: config.username,
            password: config.password,
            encryption: config.encryption || 'none',
            fromEmail: config.fromEmail,
            fromName: config.fromName
        };

        const result = await verifySmtpConfig(smtpConfig, toEmail);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

    } catch (error) {
        console.error("Error in SMTP test endpoint:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
