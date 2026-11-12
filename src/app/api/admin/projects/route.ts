import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { Project } from "@/types/project";
import defaultProjects from "@/data/projects.json";
import { verifySessionToken } from "@/lib/adminAuth";

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "projects.json");

function verifyAdminRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") || request.headers.get("x-admin-token");

  if (verifySessionToken(token)) return true;

  // Fallback check against raw secret if configured
  const legacyKey = request.headers.get("x-admin-key");
  const rawSecret = process.env.ADMIN_PASSWORD;
  return Boolean(rawSecret && legacyKey && legacyKey === rawSecret);
}

async function getStoredProjects(): Promise<Project[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.warn("Could not read projects.json from disk, falling back to bundled data:", error);
    return defaultProjects as Project[];
  }
}

async function saveStoredProjects(projects: Project[]): Promise<boolean> {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(projects, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed writing to projects.json:", error);
    return false;
  }
}

// GET all projects (public or authenticated)
export async function GET() {
  const projects = await getStoredProjects();
  return NextResponse.json({ success: true, projects });
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
      const saved = await saveStoredProjects(body.projects);
      return NextResponse.json({
        success: true,
        savedToDisk: saved,
        projects: body.projects,
        message: saved ? "All projects saved to disk" : "Saved in memory",
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
    const existingIndex = currentList.findIndex((p) => p.id === project.id);

    let updatedList: Project[];
    if (existingIndex >= 0) {
      // Update existing
      updatedList = [...currentList];
      updatedList[existingIndex] = { ...currentList[existingIndex], ...project };
    } else {
      // Prepend new project
      updatedList = [project, ...currentList];
    }

    const saved = await saveStoredProjects(updatedList);
    return NextResponse.json({
      success: true,
      savedToDisk: saved,
      project,
      projects: updatedList,
      message: saved ? "Project saved to disk" : "Project updated in memory",
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

    const currentList = await getStoredProjects();
    const updatedList = currentList.filter((p) => p.id !== id);

    const saved = await saveStoredProjects(updatedList);
    return NextResponse.json({
      success: true,
      savedToDisk: saved,
      projects: updatedList,
      message: "Project removed",
    });
  } catch (err) {
    console.error("Error deleting project:", err);
    return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 });
  }
}
