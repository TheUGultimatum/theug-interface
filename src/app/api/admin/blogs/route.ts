import { NextResponse } from "next/server";
import { XPost } from "@/config/blogsData";
import { verifySessionToken } from "@/lib/adminAuth";
import {
  getStoredBlogs,
  saveStoredBlogs,
  getStorageDiagnostics,
} from "@/lib/serverStore";
import { isNeonConfigured, neonDeleteBlog } from "@/lib/neon";

function verifyAdminRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || request.headers.get("x-admin-token");

  if (verifySessionToken(token)) return true;

  const legacyKey = request.headers.get("x-admin-key");
  const rawSecret = process.env.ADMIN_PASSWORD;
  return Boolean(rawSecret && legacyKey && legacyKey === rawSecret);
}

// GET all blogs (public list, admin gets storage diagnostics)
export async function GET(request: Request) {
  const blogs = await getStoredBlogs();
  const isAdmin = verifyAdminRequest(request);
  const storage = isAdmin ? getStorageDiagnostics() : undefined;
  return NextResponse.json({ success: true, blogs, ...(storage ? { storage } : {}) });
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
      const saveRes = await saveStoredBlogs(body.blogs);
      return NextResponse.json({
        success: true,
        saved: saveRes,
        blogs: body.blogs,
        message: "Dispatches updated successfully",
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

    if (!post.slug) {
      post.slug = post.id;
    }

    if (!post.type) {
      post.type = post.body?.trim() ? "article" : "x-post";
    }

    if (!post.url && post.type === "x-post") {
      post.url = "https://x.com/Usmaangani252";
    }

    const currentList = await getStoredBlogs();
    const existingIndex = currentList.findIndex(
      (p) => p.id === post.id || (p.slug && p.slug === post.slug)
    );

    let updatedList: XPost[];
    if (existingIndex >= 0) {
      updatedList = [...currentList];
      updatedList[existingIndex] = { ...currentList[existingIndex], ...post };
    } else {
      updatedList = [post, ...currentList];
    }

    const saveRes = await saveStoredBlogs(updatedList);
    return NextResponse.json({
      success: true,
      saved: saveRes,
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

// DELETE: Remove a dispatch by ID or slug
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

    const targetId = id.trim().toLowerCase();
    const currentList = await getStoredBlogs();
    const updatedList = currentList.filter(
      (p) =>
        p.id.toLowerCase() !== targetId &&
        (!p.slug || p.slug.toLowerCase() !== targetId)
    );

    if (updatedList.length === currentList.length) {
      return NextResponse.json({ success: false, error: "Dispatch not found" }, { status: 404 });
    }

    if (isNeonConfigured()) {
      await neonDeleteBlog(targetId);
    }

    const saveRes = await saveStoredBlogs(updatedList);
    return NextResponse.json({
      success: true,
      saved: saveRes,
      blogs: updatedList,
      message: `Dispatch ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("Failed deleting dispatch:", error);
    return NextResponse.json({ success: false, error: "Server error deleting dispatch" }, { status: 500 });
  }
}
