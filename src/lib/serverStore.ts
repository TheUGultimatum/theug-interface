import fs from "fs/promises";
import path from "path";
import os from "os";
import { XPost } from "@/config/blogsData";
import { Project } from "@/types/project";
import defaultProjects from "@/data/projects.json";

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

// GitHub GitOps Configuration (optional, enabled if GITHUB_TOKEN is present in env)
const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN ||
  process.env.GH_TOKEN ||
  process.env.GITHUB_PAT ||
  "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "TheUGultimatum";
const GITHUB_REPO = process.env.GITHUB_REPO || "theug-interface";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

// Upstash / Vercel KV Configuration (optional)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

/* ─────────────────────────────────────────────────────────────────────────────
   Upstash / Vercel KV Helpers
   ───────────────────────────────────────────────────────────────────────────── */
async function kvGet<T>(key: string): Promise<T | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.result) {
      return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
    }
    return null;
  } catch (err) {
    console.warn(`KV GET for "${key}" failed:`, err);
    return null;
  }
}

async function kvSet(key: string, value: unknown): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(JSON.stringify(value)),
    });
    return res.ok;
  } catch (err) {
    console.warn(`KV SET for "${key}" failed:`, err);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   GitHub GitOps Commit Helper (Commits directly to the repo on main branch)
   ───────────────────────────────────────────────────────────────────────────── */
async function syncToGitHub(filePath: string, contentJson: string, commitMessage: string): Promise<boolean> {
  if (!GITHUB_TOKEN) return false;

  try {
    const apiPath = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "theug-interface-cms",
    };

    // 1. Fetch current file SHA if exists
    let sha: string | undefined;
    try {
      const getRes = await fetch(`${apiPath}?ref=${GITHUB_BRANCH}`, {
        headers,
        cache: "no-store",
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }
    } catch {
      // file might not exist yet
    }

    // 2. Commit updated file
    const putRes = await fetch(apiPath, {
      method: "PUT",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(contentJson, "utf-8").toString("base64"),
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.warn(`GitHub GitOps sync failed (${putRes.status}):`, errText);
      return false;
    }

    console.info(`[GitOps] Successfully committed ${filePath} to ${GITHUB_REPO}:${GITHUB_BRANCH}`);
    return true;
  } catch (err) {
    console.warn("GitHub GitOps commit error:", err);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   BLOGS STORAGE
   ───────────────────────────────────────────────────────────────────────────── */
export async function getStoredBlogs(): Promise<XPost[]> {
  // 1. Return in-memory cache if available
  if (globalThis.__theug_blogs_cache) {
    return globalThis.__theug_blogs_cache;
  }

  // 2. Try KV
  const fromKv = await kvGet<XPost[]>("theug_blogs");
  if (fromKv && Array.isArray(fromKv)) {
    globalThis.__theug_blogs_cache = fromKv;
    return fromKv;
  }

  // 3. Try /tmp file (written by recent serverless invocations)
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
  savedToDisk: boolean;
  savedToTmp: boolean;
  savedToKv: boolean;
  savedToGitHub: boolean;
}> {
  // Always update global memory cache immediately
  globalThis.__theug_blogs_cache = blogs;
  const jsonString = JSON.stringify(blogs, null, 2);

  let savedToDisk = false;
  let savedToTmp = false;
  let savedToKv = false;
  let savedToGitHub = false;

  // 1. Write to /tmp (always writable in Vercel / AWS Lambda)
  try {
    await fs.writeFile(TMP_BLOGS_PATH, jsonString, "utf-8");
    savedToTmp = true;
  } catch (e) {
    console.warn("Could not write blogs to /tmp:", e);
  }

  // 2. Try writing to repo file (works locally, read-only on Vercel)
  try {
    await fs.writeFile(LOCAL_BLOGS_PATH, jsonString, "utf-8");
    savedToDisk = true;
  } catch {
    // expected in Vercel serverless read-only filesystem
    savedToDisk = false;
  }

  // 3. Try KV if configured
  if (KV_URL && KV_TOKEN) {
    savedToKv = await kvSet("theug_blogs", blogs);
  }

  // 4. Sync to GitHub repository if GITHUB_TOKEN is configured
  if (GITHUB_TOKEN) {
    savedToGitHub = await syncToGitHub(
      "src/data/blogs.json",
      jsonString,
      `chore(cms): update dispatches via admin [${blogs.length} items]`
    );
  }

  return { savedToDisk, savedToTmp, savedToKv, savedToGitHub };
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROJECTS STORAGE
   ───────────────────────────────────────────────────────────────────────────── */
export async function getStoredProjects(): Promise<Project[]> {
  // 1. Return in-memory cache if available
  if (globalThis.__theug_projects_cache) {
    return globalThis.__theug_projects_cache;
  }

  // 2. Try KV
  const fromKv = await kvGet<Project[]>("theug_projects");
  if (fromKv && Array.isArray(fromKv)) {
    globalThis.__theug_projects_cache = fromKv;
    return fromKv;
  }

  // 3. Try /tmp file
  try {
    const tmpData = await fs.readFile(TMP_PROJECTS_PATH, "utf-8");
    const parsed = JSON.parse(tmpData);
    if (Array.isArray(parsed)) {
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
    if (Array.isArray(parsed)) {
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
  savedToDisk: boolean;
  savedToTmp: boolean;
  savedToKv: boolean;
  savedToGitHub: boolean;
}> {
  // Always update global memory cache immediately
  globalThis.__theug_projects_cache = projects;
  const jsonString = JSON.stringify(projects, null, 2);

  let savedToDisk = false;
  let savedToTmp = false;
  let savedToKv = false;
  let savedToGitHub = false;

  // 1. Write to /tmp
  try {
    await fs.writeFile(TMP_PROJECTS_PATH, jsonString, "utf-8");
    savedToTmp = true;
  } catch (e) {
    console.warn("Could not write projects to /tmp:", e);
  }

  // 2. Try writing to repo file
  try {
    await fs.writeFile(LOCAL_PROJECTS_PATH, jsonString, "utf-8");
    savedToDisk = true;
  } catch {
    savedToDisk = false;
  }

  // 3. Try KV if configured
  if (KV_URL && KV_TOKEN) {
    savedToKv = await kvSet("theug_projects", projects);
  }

  // 4. Sync to GitHub repository if GITHUB_TOKEN is configured
  if (GITHUB_TOKEN) {
    savedToGitHub = await syncToGitHub(
      "src/data/projects.json",
      jsonString,
      `chore(cms): update projects via admin [${projects.length} items]`
    );
  }

  return { savedToDisk, savedToTmp, savedToKv, savedToGitHub };
}

/* ─────────────────────────────────────────────────────────────────────────────
   STORAGE DIAGNOSTICS
   ───────────────────────────────────────────────────────────────────────────── */
export function getStorageDiagnostics() {
  const hasGitHub = Boolean(GITHUB_TOKEN);
  const hasKv = Boolean(KV_URL && KV_TOKEN);
  const isVercel = Boolean(process.env.VERCEL);

  let mode: "github" | "kv" | "local" | "tmp" = "local";
  if (hasGitHub) mode = "github";
  else if (hasKv) mode = "kv";
  else if (isVercel) mode = "tmp";

  return {
    mode,
    isPersistent: hasGitHub || hasKv || !isVercel,
    hasGitHub,
    hasKv,
    isVercel,
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
  };
}
