import { neon } from "@neondatabase/serverless";
import { XPost } from "@/config/blogsData";
import { Project } from "@/types/project";
import defaultProjects from "@/data/projects.json";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

function getSql() {
  if (!DATABASE_URL) return null;
  return neon(DATABASE_URL);
}

let isInitialized = false;

export async function ensureDatabaseTables() {
  if (isInitialized) return true;
  const sql = getSql();
  if (!sql) return false;

  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id VARCHAR(255) PRIMARY KEY,
        slug VARCHAR(255),
        title TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'article',
        url TEXT,
        published_at VARCHAR(100),
        read_time VARCHAR(100),
        category VARCHAR(100),
        summary TEXT,
        body TEXT,
        stats JSONB,
        highlights JSONB,
        tags JSONB,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        tagline TEXT,
        description TEXT,
        stack JSONB,
        status VARCHAR(50),
        deploy_target VARCHAR(100),
        live_url TEXT,
        github_url TEXT,
        is_private BOOLEAN DEFAULT FALSE,
        banner_url TEXT,
        featured BOOLEAN DEFAULT FALSE,
        accent_color VARCHAR(100),
        accent_rgb VARCHAR(100),
        category VARCHAR(100),
        year VARCHAR(50),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // System migration table to prevent re-seeding if user intentionally deletes projects
    await sql.query(`
      CREATE TABLE IF NOT EXISTS _system_meta (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const metaRes = (await sql.query(
      `SELECT value FROM _system_meta WHERE key = 'initial_seed_completed'`
    )) as Array<{ value: string }>;

    if (!metaRes || metaRes.length === 0) {
      const countRes = (await sql.query(
        `SELECT COUNT(*)::int as count FROM projects`
      )) as Array<{ count: number }>;

      if (countRes && countRes[0] && countRes[0].count === 0) {
        console.info("[Neon] First-time initialization: seeding projects from projects.json...");
        const projectsToSeed = defaultProjects as Project[];
        for (let i = 0; i < projectsToSeed.length; i++) {
          const p = projectsToSeed[i];
          await sql.query(
            `INSERT INTO projects (
              id, name, tagline, description, stack, status, deploy_target,
              live_url, github_url, is_private, banner_url, featured,
              accent_color, accent_rgb, category, year, sort_order
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            ) ON CONFLICT (id) DO NOTHING`,
            [
              p.id,
              p.name,
              p.tagline || "",
              p.description || "",
              JSON.stringify(p.stack || []),
              p.status,
              p.deployTarget || "",
              p.liveUrl || "",
              p.githubUrl || "",
              Boolean(p.isPrivate),
              p.bannerUrl || "",
              Boolean(p.featured),
              p.accentColor || "",
              p.accentRgb || "",
              p.category || "",
              p.year || "",
              i,
            ]
          );
        }
      }
      await sql.query(
        `INSERT INTO _system_meta (key, value) VALUES ('initial_seed_completed', 'true') ON CONFLICT DO NOTHING`
      );
    }

    isInitialized = true;
    return true;
  } catch (err) {
    console.error("[Neon] Failed initializing tables:", err);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   BLOGS (NEON POSTGRES)
   ───────────────────────────────────────────────────────────────────────────── */
interface RawBlogRow {
  id: string;
  slug?: string;
  title: string;
  type?: string;
  url?: string;
  published_at?: string;
  read_time?: string;
  category?: string;
  summary?: string;
  body?: string;
  stats?: unknown;
  highlights?: unknown;
  tags?: unknown;
  is_pinned?: boolean;
}

function parseBlogRow(row: RawBlogRow): XPost {
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    type: (row.type as "article" | "x-post") || "article",
    url: row.url || "",
    publishedAt: row.published_at || "",
    readTime: row.read_time || "3 min read",
    category: (row.category as XPost["category"]) || "Web3",
    summary: row.summary || "",
    body: row.body || "",
    stats: (row.stats as XPost["stats"]) || undefined,
    highlights: Array.isArray(row.highlights)
      ? (row.highlights as string[])
      : typeof row.highlights === "string"
      ? JSON.parse(row.highlights)
      : [],
    tags: Array.isArray(row.tags)
      ? (row.tags as string[])
      : typeof row.tags === "string"
      ? JSON.parse(row.tags)
      : [],
    isPinned: Boolean(row.is_pinned),
  };
}

export async function neonGetBlogs(): Promise<XPost[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await ensureDatabaseTables();
    const rows = (await sql.query(
      `SELECT * FROM blogs ORDER BY is_pinned DESC, created_at DESC`
    )) as RawBlogRow[];
    return rows.map(parseBlogRow);
  } catch (err) {
    console.error("[Neon] neonGetBlogs error:", err);
    return null;
  }
}

export async function neonSaveBlog(post: XPost): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  try {
    await ensureDatabaseTables();
    await sql.query(
      `INSERT INTO blogs (
        id, slug, title, type, url, published_at, read_time,
        category, summary, body, stats, highlights, tags, is_pinned, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        type = EXCLUDED.type,
        url = EXCLUDED.url,
        published_at = EXCLUDED.published_at,
        read_time = EXCLUDED.read_time,
        category = EXCLUDED.category,
        summary = EXCLUDED.summary,
        body = EXCLUDED.body,
        stats = EXCLUDED.stats,
        highlights = EXCLUDED.highlights,
        tags = EXCLUDED.tags,
        is_pinned = EXCLUDED.is_pinned,
        updated_at = NOW();`,
      [
        post.id,
        post.slug || post.id,
        post.title,
        post.type || "article",
        post.url || "",
        post.publishedAt || "",
        post.readTime || "",
        post.category || "Web3",
        post.summary || "",
        post.body || "",
        JSON.stringify(post.stats || {}),
        JSON.stringify(post.highlights || []),
        JSON.stringify(post.tags || []),
        Boolean(post.isPinned),
      ]
    );
    return true;
  } catch (err) {
    console.error("[Neon] neonSaveBlog error:", err);
    return false;
  }
}

export async function neonSaveBlogsList(blogs: XPost[]): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  try {
    await ensureDatabaseTables();
    if (blogs.length === 0) {
      await sql.query(`DELETE FROM blogs`);
      return true;
    }

    // Prune blogs that are no longer in the list
    const remainingIds = blogs.map((b) => b.id);
    await sql.query(`DELETE FROM blogs WHERE NOT (id = ANY($1::text[]))`, [remainingIds]);

    // Upsert all blogs
    for (const post of blogs) {
      await neonSaveBlog(post);
    }
    return true;
  } catch (err) {
    console.error("[Neon] neonSaveBlogsList error:", err);
    return false;
  }
}

export async function neonDeleteBlog(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  try {
    await ensureDatabaseTables();
    const cleanId = id.trim().toLowerCase();
    const res = (await sql.query(
      `DELETE FROM blogs WHERE LOWER(id) = $1 OR LOWER(slug) = $1 RETURNING id`,
      [cleanId]
    )) as Array<{ id: string }>;
    return Boolean(res && res.length > 0);
  } catch (err) {
    console.error("[Neon] neonDeleteBlog error:", err);
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROJECTS (NEON POSTGRES)
   ───────────────────────────────────────────────────────────────────────────── */
interface RawProjectRow {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  stack?: unknown;
  status?: string;
  deploy_target?: string;
  live_url?: string;
  github_url?: string;
  is_private?: boolean;
  banner_url?: string;
  featured?: boolean;
  accent_color?: string;
  accent_rgb?: string;
  category?: string;
  year?: string;
  sort_order?: number;
}

function parseProjectRow(row: RawProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    description: row.description || "",
    stack: Array.isArray(row.stack)
      ? (row.stack as string[])
      : typeof row.stack === "string"
      ? JSON.parse(row.stack)
      : [],
    status: (row.status as Project["status"]) || "wip",
    deployTarget: row.deploy_target || undefined,
    liveUrl: row.live_url || undefined,
    githubUrl: row.github_url || undefined,
    isPrivate: Boolean(row.is_private),
    bannerUrl: row.banner_url || undefined,
    featured: Boolean(row.featured),
    accentColor: row.accent_color || "var(--color-cyan)",
    accentRgb: row.accent_rgb || "0,212,255",
    category: (row.category as Project["category"]) || "FULL STACK",
    year: row.year || "2026",
  };
}

export async function neonGetProjects(): Promise<Project[] | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await ensureDatabaseTables();
    const rows = (await sql.query(
      `SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC`
    )) as RawProjectRow[];
    return rows.map(parseProjectRow);
  } catch (err) {
    console.error("[Neon] neonGetProjects error:", err);
    return null;
  }
}

export async function neonSaveProject(project: Project, sortOrder?: number): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  try {
    await ensureDatabaseTables();
    await sql.query(
      `INSERT INTO projects (
        id, name, tagline, description, stack, status, deploy_target,
        live_url, github_url, is_private, banner_url, featured,
        accent_color, accent_rgb, category, year, sort_order, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        stack = EXCLUDED.stack,
        status = EXCLUDED.status,
        deploy_target = EXCLUDED.deploy_target,
        live_url = EXCLUDED.live_url,
        github_url = EXCLUDED.github_url,
        is_private = EXCLUDED.is_private,
        banner_url = EXCLUDED.banner_url,
        featured = EXCLUDED.featured,
        accent_color = EXCLUDED.accent_color,
        accent_rgb = EXCLUDED.accent_rgb,
        category = EXCLUDED.category,
        year = EXCLUDED.year,
        sort_order = COALESCE(EXCLUDED.sort_order, projects.sort_order),
        updated_at = NOW();`,
      [
        project.id,
        project.name,
        project.tagline || "",
        project.description || "",
        JSON.stringify(project.stack || []),
        project.status,
        project.deployTarget || "",
        project.liveUrl || "",
        project.githubUrl || "",
        Boolean(project.isPrivate),
        project.bannerUrl || "",
        Boolean(project.featured),
        project.accentColor || "",
        project.accentRgb || "",
        project.category || "",
        project.year || "",
        sortOrder ?? 0,
      ]
    );
    return true;
  } catch (err) {
    console.error("[Neon] neonSaveProject error:", err);
    return false;
  }
}

export async function neonSaveProjectsList(projects: Project[]): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  try {
    await ensureDatabaseTables();
    if (projects.length === 0) {
      await sql.query(`DELETE FROM projects`);
      return true;
    }

    // Prune removed projects
    const remainingIds = projects.map((p) => p.id);
    await sql.query(`DELETE FROM projects WHERE NOT (id = ANY($1::text[]))`, [remainingIds]);

    // Upsert all projects with new sort order
    for (let i = 0; i < projects.length; i++) {
      await neonSaveProject(projects[i], i);
    }
    return true;
  } catch (err) {
    console.error("[Neon] neonSaveProjectsList error:", err);
    return false;
  }
}

export async function neonDeleteProject(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;

  try {
    await ensureDatabaseTables();
    const cleanId = id.trim().toLowerCase();
    const res = (await sql.query(
      `DELETE FROM projects WHERE LOWER(id) = $1 RETURNING id`,
      [cleanId]
    )) as Array<{ id: string }>;
    return Boolean(res && res.length > 0);
  } catch (err) {
    console.error("[Neon] neonDeleteProject error:", err);
    return false;
  }
}

export function isNeonConfigured(): boolean {
  return Boolean(DATABASE_URL);
}
