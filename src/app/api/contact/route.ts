import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    // 1. Parse JSON payload
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { name, email, message, honey } = body;

    // 2. Honeypot check (Spam Prevention)
    // If a bot fills out this invisible field, silently discard or reject the request
    if (honey && honey.trim() !== "") {
      console.warn("Spam attempt detected via honeypot field.");
      // Return a 200 OK so the spam bot thinks it succeeded, but do absolutely nothing
      return NextResponse.json({ success: true, message: "Transmission accepted." });
    }

    // 3. Server-side Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // 4. Length Limits (Performance & Security)
    if (name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Name must be less than 100 characters" },
        { status: 400 }
      );
    }
    if (email.length > 150) {
      return NextResponse.json(
        { success: false, error: "Email must be less than 150 characters" },
        { status: 400 }
      );
    }
    if (message.length > 4000) {
      return NextResponse.json(
        { success: false, error: "Message must be less than 4000 characters" },
        { status: 400 }
      );
    }

    // 5. Email Regex Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 6. Resend Gateway Setup
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[CRITICAL] RESEND_API_KEY is not defined in environment variables.");
      return NextResponse.json(
        { success: false, error: "Mail gateway configuration error" },
        { status: 500 }
      );
    }

    // Initialize Resend with key ONLY on server-side
    const resend = new Resend(apiKey);

    // Sanitize and format the message text slightly to prevent HTML injection in the template
    const sanitizedMessage = message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // 7. Dispatch Mail Transmission
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "usmaangani253@gmail.com",
      subject: `[Portfolio Link] Telemetry Uplink from ${name.trim()}`,
      html: `
        <div style="font-family: 'Courier New', Courier, monospace; padding: 24px; background-color: #050505; color: #ededed; border: 1px solid #1a1a1a; border-radius: 4px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);">
          <h2 style="color: #ff5e3a; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; margin-top: 0; font-size: 16px; letter-spacing: 0.1em; text-transform: uppercase;">
            [TELEMETRY UPLINK RECEIVED]
          </h2>
          <div style="margin: 16px 0; font-size: 13px; line-height: 1.6;">
            <p style="margin: 6px 0;"><strong style="color: #00d9ff; text-transform: uppercase;">SENDER_NAME:</strong> ${name.trim()}</p>
            <p style="margin: 6px 0;"><strong style="color: #00d9ff; text-transform: uppercase;">SENDER_EMAIL:</strong> <a href="mailto:${email.trim()}" style="color: #00d9ff; text-decoration: none;">${email.trim()}</a></p>
            <p style="margin: 6px 0; margin-top: 20px;"><strong style="color: #00d9ff; text-transform: uppercase;">PAYLOAD_TRANSMISSION:</strong></p>
            <pre style="background-color: #0a0a0a; padding: 16px; border-radius: 4px; border: 1px solid #1a1a1a; white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #ededed; margin: 8px 0; line-height: 1.5; overflow-x: auto;">${sanitizedMessage}</pre>
          </div>
          <div style="font-size: 10px; color: #555555; margin-top: 32px; border-top: 1px solid #1a1a1a; padding-top: 12px; letter-spacing: 0.05em; text-align: center; text-transform: uppercase;">
            Origin: My-Portfolio-website &middot; secure_channel: active &middot; Gateway: resend_telemetry
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error details:", error);
      return NextResponse.json(
        { success: false, error: error.message || "Failed to dispatch email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Transmission complete.",
      id: data?.id,
    });
  } catch (error: any) {
    console.error("Unhanded server error in /api/contact:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
