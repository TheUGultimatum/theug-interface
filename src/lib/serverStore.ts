import fs from "fs/promises";
import path from "path";
import os from "os";
import { XPost } from "@/config/blogsData";
import { Project } from "@/types/project";
import defaultProjects from "@/data/projects.json";
import {
  isNeonConfigured,
  neonGetBlogs,
  neonSaveBlogsList,
  neonGetProjects,
  neonSaveProjectsList,
} from "./neon";

// In-memory cache across serverless warm invocations
declare global {
  // eslint-disable-next-line no-var
  var __theug_blogs_cache: XPost[] | undefined;
  // eslint-disable-next-line no-var
  var __theug_projects_cache: Project[] | undefined;
}

const LOCAL_BLOGS_PATH = path.join(process.cwd(), "src", "data", "blogs.json");
const LOCAL_PROJECTS_PATH = path.join(process.cwd(), "src", "data", "projects.json");

const TMP_BLOGS_PATH = path.join(os.tmpdir(), "theug_blogs_store.json");
const TMP_PROJECTS_PATH = path.join(os.tmpdir(), "theug_projects_store.json");

/* ─────────────────────────────────────────────────────────────────────────────
   BLOGS STORAGE (NEON -> MEMORY -> TMP -> LOCAL FILE)
   ───────────────────────────────────────────────────────────────────────────── */
export async function getStoredBlogs(): Promise<XPost[]> {
  // 1. Neon Serverless Postgres (Primary Database)
  if (isNeonConfigured()) {
    try {
      const fromNeon = await neonGetBlogs();
      if (fromNeon !== null) {
        globalThis.__theug_blogs_cache = fromNeon;
        return fromNeon;
      }
    } catch (err) {
      console.warn("[Store] Neon getBlogs error, falling back to memory/file:", err);
    }
  }

  // 2. Return in-memory cache if available
  if (globalThis.__theug_blogs_cache) {
    return globalThis.__theug_blogs_cache;
  }

  // 3. Try /tmp file
  try {
    const tmpData = await fs.readFile(TMP_BLOGS_PATH, "utf-8");
    const parsed = JSON.parse(tmpData);
    if (Array.isArray(parsed)) {
      globalThis.__theug_blogs_cache = parsed;
      return parsed;
    }
  } catch {
    // continue
  }

  // 4. Try local repo file
  try {
    const localData = await fs.readFile(LOCAL_BLOGS_PATH, "utf-8");
    const parsed = JSON.parse(localData);
    if (Array.isArray(parsed)) {
      globalThis.__theug_blogs_cache = parsed;
      return parsed;
    }
  } catch {
    // continue
  }

  globalThis.__theug_blogs_cache = [];
  return [];
}

export async function saveStoredBlogs(blogs: XPost[]): Promise<{
  savedToNeon: boolean;
  savedToDisk: boolean;
  savedToTmp: boolean;
}> {
  // Always update global memory cache immediately
  globalThis.__theug_blogs_cache = blogs;
  const jsonString = JSON.stringify(blogs, null, 2);

  let savedToNeon = false;
  let savedToDisk = false;
  let savedToTmp = false;

  // 1. Save to Neon Postgres
  if (isNeonConfigured()) {
    try {
      savedToNeon = await neonSaveBlogsList(blogs);
    } catch (err) {
      console.error("[Store] Neon saveStoredBlogs error:", err);
    }
  }

  // 2. Write to /tmp (always writable in Vercel / AWS Lambda)
  try {
    await fs.writeFile(TMP_BLOGS_PATH, jsonString, "utf-8");
    savedToTmp = true;
  } catch (e) {
    console.warn("Could not write blogs to /tmp:", e);
  }

  // 3. Try writing to repo file (works locally, read-only on Vercel)
  try {
    await fs.writeFile(LOCAL_BLOGS_PATH, jsonString, "utf-8");
    savedToDisk = true;
  } catch {
    savedToDisk = false;
  }

  return { savedToNeon, savedToDisk, savedToTmp };
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROJECTS STORAGE (NEON -> MEMORY -> TMP -> LOCAL FILE)
   ───────────────────────────────────────────────────────────────────────────── */
export async function getStoredProjects(): Promise<Project[]> {
  // 1. Neon Serverless Postgres (Primary Database)
  if (isNeonConfigured()) {
    try {
      const fromNeon = await neonGetProjects();
      if (fromNeon !== null) {
        globalThis.__theug_projects_cache = fromNeon;
        return fromNeon;
      }
    } catch (err) {
      console.warn("[Store] Neon getProjects error, falling back to memory/file:", err);
    }
  }

  // 2. Return in-memory cache if available
  if (globalThis.__theug_projects_cache) {
    return globalThis.__theug_projects_cache;
  }

  // 3. Try /tmp file
  try {
    const tmpData = await fs.readFile(TMP_PROJECTS_PATH, "utf-8");
    const parsed = JSON.parse(tmpData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalThis.__theug_projects_cache = parsed;
      return parsed;
    }
  } catch {
    // continue
  }

  // 4. Try local repo file
  try {
    const localData = await fs.readFile(LOCAL_PROJECTS_PATH, "utf-8");
    const parsed = JSON.parse(localData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      globalThis.__theug_projects_cache = parsed;
      return parsed;
    }
  } catch {
    // continue
  }

  // 5. Fallback to bundled projects
  const fallback = defaultProjects as Project[];
  globalThis.__theug_projects_cache = fallback;
  return fallback;
}

export async function saveStoredProjects(projects: Project[]): Promise<{
  savedToNeon: boolean;
  savedToDisk: boolean;
  savedToTmp: boolean;
}> {
  // Always update global memory cache immediately
  globalThis.__theug_projects_cache = projects;
  const jsonString = JSON.stringify(projects, null, 2);

  let savedToNeon = false;
  let savedToDisk = false;
  let savedToTmp = false;

  // 1. Save to Neon Postgres
  if (isNeonConfigured()) {
    try {
      savedToNeon = await neonSaveProjectsList(projects);
    } catch (err) {
      console.error("[Store] Neon saveStoredProjects error:", err);
    }
  }

  // 2. Write to /tmp
  try {
    await fs.writeFile(TMP_PROJECTS_PATH, jsonString, "utf-8");
    savedToTmp = true;
  } catch (e) {
    console.warn("Could not write projects to /tmp:", e);
  }

  // 3. Try writing to repo file
  try {
    await fs.writeFile(LOCAL_PROJECTS_PATH, jsonString, "utf-8");
    savedToDisk = true;
  } catch {
    savedToDisk = false;
  }

  return { savedToNeon, savedToDisk, savedToTmp };
}

/* ─────────────────────────────────────────────────────────────────────────────
   STORAGE DIAGNOSTICS
   ───────────────────────────────────────────────────────────────────────────── */
export function getStorageDiagnostics() {
  const hasNeon = isNeonConfigured();
  const isVercel = Boolean(process.env.VERCEL);

  let mode: "neon" | "local" | "tmp" = "local";
  if (hasNeon) mode = "neon";
  else if (isVercel) mode = "tmp";

  return {
    mode,
    isPersistent: hasNeon || !isVercel,
    hasNeon,
    isVercel,
    database: hasNeon ? "Neon Serverless Postgres" : "File-based fallback",
  };
}
