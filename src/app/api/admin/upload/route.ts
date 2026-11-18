import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifySessionToken } from "@/lib/adminAuth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "projects");
const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

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

    // 2. Validate strict allowed MIME type and extension
    const ext = MIME_EXTENSION_MAP[file.type.toLowerCase()];
    if (!ext) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type: ${file.type}. Allowed: PNG, JPEG, WEBP, GIF`,
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
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch {
      // ignore on serverless read-only
    }

    // 5. Generate safe unique filename using enforced extension only
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanBase = path.basename(file.name, path.extname(file.name)).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueName = `theug_${cleanBase}_${Date.now()}${ext}`.toLowerCase();
    const targetFilePath = path.join(UPLOAD_DIR, uniqueName);

    try {
      await fs.writeFile(targetFilePath, buffer);
    } catch {
      // If filesystem is read-only (e.g. Vercel), convert to data URL so the image still renders
      const base64Data = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUri,
        name: uniqueName,
        size: file.size,
        message: "Image uploaded as inline asset",
      });
    }

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

