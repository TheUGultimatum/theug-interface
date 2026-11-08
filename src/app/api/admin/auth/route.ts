import { NextResponse } from "next/server";
import {
  verifyCredentials,
  createSessionToken,
  verifySessionToken,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/adminAuth";

// Verify existing session token
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || request.headers.get("x-admin-token");

  if (verifySessionToken(token)) {
    return NextResponse.json({ success: true, valid: true });
  }

  return NextResponse.json({ success: false, valid: false }, { status: 401 });
}

// Authenticate with Username + Password + Security PIN
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "localhost";
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Security lock active due to too many failed attempts. Try again in ${rateCheck.waitSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const { username, password, pin, token } = await request.json();

    // Session validation mode
    if (token) {
      if (verifySessionToken(token)) {
        return NextResponse.json({ success: true, valid: true });
      }
      return NextResponse.json({ success: false, error: "Session expired or invalid" }, { status: 401 });
    }

    // Credentials validation mode
    const isValid = verifyCredentials(username?.trim(), password?.trim(), pin?.trim());

    if (!isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: Invalid Username, Password, or Security PIN.",
        },
        { status: 401 }
      );
    }

    resetRateLimit(ip);
    const session = createSessionToken();

    return NextResponse.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      message: "Authorization verified. High-clearance session active.",
    });
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { success: false, error: "Internal security gateway error" },
      { status: 500 }
    );
  }
}
