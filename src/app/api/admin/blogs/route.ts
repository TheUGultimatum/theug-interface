import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { XPost } from "@/config/blogsData";
import { verifySessionToken } from "@/lib/adminAuth";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "blogs.json");

function verifyAdminRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || request.headers.get("x-admin-token");

  if (verifySessionToken(token)) return true;

  const legacyKey = request.headers.get("x-admin-key");
  const rawSecret = process.env.ADMIN_PASSWORD || "theug-ultimatum-2026";
  return legacyKey === rawSecret;
}

async function getStoredBlogs(): Promise<XPost[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.warn("Could not read blogs.json from disk, returning empty list:", error);
    return [];
  }
}

async function saveStoredBlogs(blogs: XPost[]): Promise<boolean> {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(blogs, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed writing to blogs.json:", error);
    return false;
  }
}

// GET all blogs
export async function GET() {
  const blogs = await getStoredBlogs();
  return NextResponse.json({ success: true, blogs });
}

// POST: Add new blog or replace entire list
export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid security session" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Mode 1: Bulk replace (e.g. reordering)
    if (Array.isArray(body.blogs)) {
      const saved = await saveStoredBlogs(body.blogs);
      return NextResponse.json({
        success: true,
        savedToDisk: saved,
        blogs: body.blogs,
        message: saved ? "All dispatches saved to disk" : "Saved in memory",
      });
    }

    // Mode 2: Single blog addition or update
    const post: XPost = body.post || body.blog;
    if (!post || !post.title) {
      return NextResponse.json(
        { success: false, error: "Dispatch title is required" },
        { status: 400 }
      );
    }

    if (!post.id) {
      post.id = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    if (!post.url) {
      post.url = "https://x.com/Usmaangani252";
    }

    const currentList = await getStoredBlogs();
    const existingIndex = currentList.findIndex((p) => p.id === post.id);

    let updatedList: XPost[];
    if (existingIndex >= 0) {
      updatedList = [...currentList];
      updatedList[existingIndex] = { ...currentList[existingIndex], ...post };
    } else {
      updatedList = [post, ...currentList];
    }

    const saved = await saveStoredBlogs(updatedList);
    return NextResponse.json({
      success: true,
      savedToDisk: saved,
      post,
      blogs: updatedList,
      message: `Dispatch "${post.title}" published successfully`,
    });
  } catch (error) {
    console.error("Failed to process dispatch post:", error);
    return NextResponse.json(
      { success: false, error: "Malformed payload or server error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a dispatch by ID
export async function DELETE(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid security session" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Dispatch ID is required" }, { status: 400 });
    }

    const currentList = await getStoredBlogs();
    const updatedList = currentList.filter((p) => p.id !== id);

    if (updatedList.length === currentList.length) {
      return NextResponse.json({ success: false, error: "Dispatch not found" }, { status: 404 });
    }

    const saved = await saveStoredBlogs(updatedList);
    return NextResponse.json({
      success: true,
      savedToDisk: saved,
      blogs: updatedList,
      message: `Dispatch ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Failed deleting dispatch:", error);
    return NextResponse.json({ success: false, error: "Server error deleting dispatch" }, { status: 500 });
  }
}
