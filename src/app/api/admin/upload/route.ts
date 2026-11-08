import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifySessionToken } from "@/lib/adminAuth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "projects");
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  // 1. Verify admin session token
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || request.headers.get("x-admin-token");

  if (!verifySessionToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid or expired session" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // 2. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Allowed: PNG, JPEG, WEBP, GIF, SVG`,
        },
        { status: 400 }
      );
    }

    // 3. Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // 4. Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    // 5. Generate safe unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || `.${file.type.split("/")[1] || "png"}`;
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `theug_${cleanBase}_${Date.now()}${ext}`.toLowerCase();
    const targetFilePath = path.join(UPLOAD_DIR, uniqueName);

    await fs.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/projects/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: uniqueName,
      size: file.size,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process and store uploaded image" },
      { status: 500 }
    );
  }
}

