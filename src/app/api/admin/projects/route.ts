import { NextResponse } from "next/server";
import { Project } from "@/types/project";
import { verifySessionToken } from "@/lib/adminAuth";
import {
  getStoredProjects,
  saveStoredProjects,
  getStorageDiagnostics,
} from "@/lib/serverStore";
import { isNeonConfigured, neonDeleteProject } from "@/lib/neon";

function verifyAdminRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || request.headers.get("x-admin-token");

  if (verifySessionToken(token)) return true;

  const legacyKey = request.headers.get("x-admin-key");
  const rawSecret = process.env.ADMIN_PASSWORD;
  return Boolean(rawSecret && legacyKey && legacyKey === rawSecret);
}

// GET all projects (public list, admin gets storage diagnostics)
export async function GET(request: Request) {
  const projects = await getStoredProjects();
  const isAdmin = verifyAdminRequest(request);
  const storage = isAdmin ? getStorageDiagnostics() : undefined;
  return NextResponse.json({ success: true, projects, ...(storage ? { storage } : {}) });
}

// POST: Add new project or replace entire list
export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid security session" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Mode 1: Bulk replace (e.g. reorder / batch update)
    if (Array.isArray(body.projects)) {
      const saveRes = await saveStoredProjects(body.projects);
      return NextResponse.json({
        success: true,
        saved: saveRes,
        projects: body.projects,
        message: "Projects list updated successfully",
      });
    }

    // Mode 2: Single project addition or update
    const project: Project = body.project;
    if (!project || !project.name) {
      return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    }

    // Auto-generate id if not supplied
    if (!project.id) {
      project.id = project.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const currentList = await getStoredProjects();
    const existingIndex = currentList.findIndex(
      (p) => p.id.toLowerCase() === project.id.toLowerCase()
    );

    let updatedList: Project[];
    if (existingIndex >= 0) {
      // Update existing
      updatedList = [...currentList];
      updatedList[existingIndex] = { ...currentList[existingIndex], ...project };
    } else {
      // Prepend new project
      updatedList = [project, ...currentList];
    }

    const saveRes = await saveStoredProjects(updatedList);
    return NextResponse.json({
      success: true,
      saved: saveRes,
      project,
      projects: updatedList,
      message: `Project "${project.name}" saved successfully`,
    });
  } catch (err) {
    console.error("Error saving project:", err);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}

// DELETE: Remove project by ID
export async function DELETE(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized: Invalid security session" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Project ID is required" }, { status: 400 });
    }

    const targetId = id.trim().toLowerCase();
    const currentList = await getStoredProjects();
    const updatedList = currentList.filter(
      (p) => p.id.toLowerCase() !== targetId
    );

    if (updatedList.length === currentList.length) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    if (isNeonConfigured()) {
      await neonDeleteProject(targetId);
    }

    const saveRes = await saveStoredProjects(updatedList);
    return NextResponse.json({
      success: true,
      saved: saveRes,
      projects: updatedList,
      message: `Project ${id} removed successfully`,
    });
  } catch (err) {
    console.error("Error deleting project:", err);
    return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 });
  }
}
