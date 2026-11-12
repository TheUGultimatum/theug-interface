"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Project, ProjectStatus } from "@/types/project";
import { XPost } from "@/config/blogsData";
import defaultProjects from "@/data/projects.json";
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Code2,
  Lock,
  Eye,
  Save,
  Download,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  KeyRound,
  UserCheck,
  FolderOpen,
  BookOpen,
  Pin,
  Heart,
  Repeat2,
  ArrowUpRight,
  FileText,
} from "lucide-react";

function XIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`fill-current ${className}`}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const PRESET_CATEGORIES = [
  "WEB3 / GAMING",
  "AI / AUTOMATION",
  "INFRASTRUCTURE / NODES",
  "FULL STACK",
  "TOOLING / CLI",
];

const BLOG_CATEGORIES: Array<XPost["category"]> = [
  "Web3",
  "AI & Agents",
  "Build In Public",
  "CT Alpha",
  "Engineering",
];

const EMPTY_PROJECT: Project = {
  id: "",
  name: "",
  tagline: "",
  description: "",
  stack: ["Next.js", "TypeScript"],
  status: "live",
  deployTarget: "VERCEL",
  liveUrl: "",
  githubUrl: "",
  featured: false,
  isPrivate: false,
  bannerUrl: "",
  accentColor: "var(--color-cyan)",
  accentRgb: "0,212,255",
  category: "FULL STACK",
  year: new Date().getFullYear().toString(),
};

const EMPTY_BLOG: XPost = {
  id: "",
  slug: "",
  title: "",
  type: "article",
  url: "",
  publishedAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  readTime: "3 min read",
  category: "Web3",
  summary: "",
  body: "",
  content: [],
  stats: {
    likes: "",
    reposts: "",
    views: "",
  },
  highlights: [],
  tags: ["#Web3"],
  isPinned: false,
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Active Management Tab: "projects" or "blogs"
  const [activeTab, setActiveTab] = useState<"projects" | "blogs">("projects");

  // Credentials
  const [username, setUsername] = useState<string>("theug");
  const [password, setPassword] = useState<string>("");
  const [pin, setPin] = useState<string>("");

  // Projects State
  const [projects, setProjects] = useState<Project[]>(defaultProjects as Project[]);
  const [isEditingProject, setIsEditingProject] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project>(EMPTY_PROJECT);
  const [stackInput, setStackInput] = useState<string>("");

  // Blogs State
  const [blogs, setBlogs] = useState<XPost[]>([]);
  const [isEditingBlog, setIsEditingBlog] = useState<boolean>(false);
  const [currentBlog, setCurrentBlog] = useState<XPost>(EMPTY_BLOG);
  const [highlightsInput, setHighlightsInput] = useState<string>("");
  const [tagsInput, setTagsInput] = useState<string>("");
  const [isFetchingPreview, setIsFetchingPreview] = useState<boolean>(false);
  const [previewingBlog, setPreviewingBlog] = useState<XPost | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // Notifications & Uploads
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check saved session token on load
  useEffect(() => {
    const savedToken = localStorage.getItem("theug_admin_session_token");
    if (savedToken) {
      validateExistingSession(savedToken);
    }
  }, []);

  const validateExistingSession = async (token: string) => {
    setIsLoadingAuth(true);
    try {
      const res = await fetch("/api/admin/auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setSessionToken(token);
        setIsAuthenticated(true);
        loadProjects(token);
        loadBlogs(token);
      } else {
        localStorage.removeItem("theug_admin_session_token");
      }
    } catch {
      localStorage.removeItem("theug_admin_session_token");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !pin.trim()) {
      setAuthError("Please provide Username, Password, and Security PIN");
      return;
    }

    setIsLoadingAuth(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          pin: pin.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        setSessionToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem("theug_admin_session_token", data.token);
        loadProjects(data.token);
        loadBlogs(data.token);
        notify("Logged in successfully", "success");
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch {
      setAuthError("Failed to communicate with security gateway");
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSessionToken("");
    localStorage.removeItem("theug_admin_session_token");
    setPassword("");
    setPin("");
    notify("Logged out successfully");
  };

  const loadProjects = async (token: string) => {
    try {
      const res = await fetch("/api/admin/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn("Using bundled projects as fallback", err);
    }
  };

  const loadBlogs = async (token?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token || sessionToken) {
        headers.Authorization = `Bearer ${token || sessionToken}`;
      }
      const res = await fetch("/api/admin/blogs", { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.warn("Failed loading blogs", err);
    }
  };

  const notify = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  /* ─────────────────────────────────────────────────────────
     PROJECT ACTIONS
     ───────────────────────────────────────────────────────── */
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setCurrentProject((prev) => ({
          ...prev,
          bannerUrl: data.url,
        }));
        notify("Project banner uploaded successfully!");
      } else {
        notify(data.error || "Upload failed", "error");
      }
    } catch {
      notify("Network error while uploading image", "error");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject.name.trim()) {
      notify("Project name is required", "error");
      return;
    }

    const projectToSave: Project = {
      ...currentProject,
      id:
        currentProject.id.trim() ||
        currentProject.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
    };

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ project: projectToSave }),
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
        setIsEditingProject(false);
        setCurrentProject(EMPTY_PROJECT);
        notify(`Project "${projectToSave.name}" published!`);
      } else {
        notify(data.error || "Failed to save project", "error");
      }
    } catch {
      notify("Network error while saving project", "error");
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Delete project "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
        notify(`Project "${name}" removed`);
      }
    } catch {
      notify("Error deleting project", "error");
    }
  };

  const handleReorderProject = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newProjects = [...projects];
    const [moved] = newProjects.splice(index, 1);
    newProjects.splice(targetIndex, 0, moved);
    setProjects(newProjects);

    try {
      await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ projects: newProjects }),
      });
      notify("Order updated");
    } catch {
      notify("Failed to save order", "error");
    }
  };

  /* ─────────────────────────────────────────────────────────
     BLOG / ARTICLE ACTIONS
     ───────────────────────────────────────────────────────── */
  const handleOpenBlogEditor = (blog?: XPost) => {
    if (blog) {
      setCurrentBlog({
        ...blog,
        type: blog.type || (blog.body ? "article" : "x-post"),
      });
      setHighlightsInput((blog.highlights || []).join("\n"));
      setTagsInput((blog.tags || []).join(", "));
    } else {
      setCurrentBlog({
        ...EMPTY_BLOG,
        type: "article",
      });
      setHighlightsInput("");
      setTagsInput("#Web3");
    }
    setIsEditingBlog(true);
  };

  const handleAutoFetchLink = async (customUrl?: string) => {
    const targetUrl = customUrl || currentBlog.url;
    if (!targetUrl || !targetUrl.trim()) {
      notify("Please enter an X post or article URL to auto-fill", "error");
      return;
    }

    setIsFetchingPreview(true);
    try {
      const res = await fetch("/api/admin/preview-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentBlog((prev) => ({
          ...prev,
          title: prev.title.trim() && prev.title !== "Dispatch Title" ? prev.title : (data.title || prev.title),
          summary: prev.summary.trim() ? prev.summary : (data.summary || prev.summary),
          body: prev.body || (data.content ? data.content.join("\n\n") : ""),
        }));

        if (data.tags && data.tags.length > 0) {
          setTagsInput(data.tags.join(", "));
        }

        if (data.content && data.content.length > 1 && !highlightsInput) {
          setHighlightsInput(data.content.slice(1, 4).join("\n"));
        }

        notify("⚡ Auto-preview data fetched successfully!");
      } else {
        notify(data.error || "Could not fetch preview", "error");
      }
    } catch {
      notify("Network error while fetching preview", "error");
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!currentBlog.title.trim()) {
      notify("Title is required", "error");
      return;
    }

    const highlights = highlightsInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const slug =
      currentBlog.slug?.trim() ||
      currentBlog.id?.trim() ||
      currentBlog.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const blogToSave: XPost = {
      ...currentBlog,
      id: slug,
      slug,
      type: currentBlog.type || (currentBlog.body?.trim() ? "article" : "x-post"),
      url: currentBlog.url?.trim() || (currentBlog.type === "x-post" ? "https://x.com/Usmaangani252" : ""),
      highlights,
      tags,
    };

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ post: blogToSave }),
      });
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
        setIsEditingBlog(false);
        setCurrentBlog(EMPTY_BLOG);
        notify(`Published "${blogToSave.title}"!`);
      } else {
        notify(data.error || "Failed to save", "error");
      }
    } catch {
      notify("Network error while saving dispatch", "error");
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
        notify(`Deleted "${title}"`);
      }
    } catch {
      notify("Error deleting dispatch", "error");
    }
  };

  const handleReorderBlog = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blogs.length) return;

    const newBlogs = [...blogs];
    const [moved] = newBlogs.splice(index, 1);
    newBlogs.splice(targetIndex, 0, moved);
    setBlogs(newBlogs);

    try {
      await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ blogs: newBlogs }),
      });
      notify("Order updated");
    } catch {
      notify("Failed to save order", "error");
    }
  };

  // Filter queries
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.tagline?.toLowerCase().includes(q) ||
      p.stack.some((s) => s.toLowerCase().includes(q));
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "FEATURED" && p.featured) ||
      (activeFilter === "LIVE" && p.status === "live") ||
      (activeFilter === "PRIVATE" && p.isPrivate);
    return matchesSearch && matchesFilter;
  });

  const filteredBlogs = blogs.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.summary.toLowerCase().includes(q) ||
      b.tags?.some((t) => t.toLowerCase().includes(q));
    const matchesFilter =
      activeFilter === "ALL" ||
      b.category === activeFilter ||
      (activeFilter === "ARTICLES" && (b.type === "article" || b.body)) ||
      (activeFilter === "X_POSTS" && (b.type === "x-post" && !b.body));
    return matchesSearch && matchesFilter;
  });

  /* ─────────────────────────────────────────────────────────
     LOGIN GATE
     ───────────────────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full p-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="flex items-center gap-3 pb-5 border-b border-[var(--color-border)]">
            <div className="p-2.5 rounded-lg bg-[rgba(255,94,58,0.1)] text-[var(--color-amber)]">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="font-bold text-base text-[var(--color-text-primary)]">
                Admin Console Login
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                theUG_ Portfolio Management
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4 text-xs font-mono">
            <div>
              <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="theug"
                className="w-full px-3.5 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[var(--color-text-secondary)] mb-1 font-semibold">
                6-Digit PIN
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="252252"
                className="w-full px-3.5 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] tracking-widest focus:outline-none focus:border-[var(--color-amber)]"
              />
            </div>

            {authError && (
              <div className="p-3 rounded bg-[rgba(255,51,51,0.1)] border border-[rgba(255,51,51,0.3)] text-[var(--color-error)] text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="mt-2 py-3 px-4 rounded bg-[var(--color-amber)] text-black font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoadingAuth ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Authenticate & Open Console</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-mono">
            <Link href="/" className="hover:text-[var(--color-amber)] transition-colors">
              ← Return to site
            </Link>
            <span>v2.4 Clear</span>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     AUTHENTICATED ADMIN CONSOLE
     ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-[1280px] mx-auto pb-24">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center gap-2.5 text-xs font-mono transition-all ${
            statusMessage.type === "success"
              ? "bg-[var(--color-surface)] border-[var(--color-online)] text-[var(--color-text-primary)]"
              : "bg-[var(--color-surface)] border-[var(--color-error)] text-[var(--color-error)]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={16} className="text-[var(--color-online)]" />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-online)]" />
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
              TheUG Console · Verified Admin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">
            Site Control Hub
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Manage your live Web3 projects, articles, and X thread dispatches with instant sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs">
          <Link
            href={activeTab === "projects" ? "/projects" : "/blogs"}
            target="_blank"
            className="px-3.5 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)] flex items-center gap-1.5 transition-colors"
          >
            <Eye size={13} />
            <span>Live {activeTab.toUpperCase()}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Clean Tab Bar */}
      <div className="flex items-center justify-between gap-4 mt-6 border-b border-[var(--color-border)] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("projects");
              setActiveFilter("ALL");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-[var(--color-amber)] text-black font-semibold shadow-sm"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
            }`}
          >
            <FolderOpen size={14} />
            <span>PROJECTS ({projects.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("blogs");
              setActiveFilter("ALL");
              setSearchQuery("");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "blogs"
                ? "bg-[var(--color-amber)] text-black font-semibold shadow-sm"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
            }`}
          >
            <BookOpen size={14} />
            <span>ARTICLES & DISPATCHES ({blogs.length})</span>
          </button>
        </div>

        {/* Action Button */}
        <div>
          {activeTab === "projects" ? (
            <button
              onClick={() => {
                setCurrentProject(EMPTY_PROJECT);
                setIsEditingProject(true);
              }}
              className="px-4 py-2 rounded-lg bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer font-mono"
            >
              <Plus size={15} />
              <span>New Project</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenBlogEditor()}
              className="px-4 py-2 rounded-lg bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer font-mono"
            >
              <Plus size={15} />
              <span>Write Article / Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          TAB 1: PROJECTS INVENTORY
          ───────────────────────────────────────────────────── */}
      {activeTab === "projects" && (
        <div className="mt-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--color-border)] font-mono text-xs">
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "LIVE", "FEATURED", "PRIVATE"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? "bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                <p className="text-sm text-[var(--color-text-secondary)]">No projects found.</p>
                <button
                  onClick={() => {
                    setCurrentProject(EMPTY_PROJECT);
                    setIsEditingProject(true);
                  }}
                  className="mt-3 px-4 py-2 rounded bg-[var(--color-amber)] text-black font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create First Project</span>
                </button>
              </div>
            ) : (
              filteredProjects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="p-4 md:p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--color-border-bright)] shadow-sm"
                >
                  {project.bannerUrl && (
                    <div className="relative w-20 h-14 rounded overflow-hidden border border-[var(--color-border)] shrink-0 bg-black hidden sm:block">
                      <Image
                        src={project.bannerUrl}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1 text-[11px] font-mono">
                      <span className="text-[var(--color-text-muted)] font-semibold">
                        {project.category}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[var(--color-online)] font-bold">
                        {project.status}
                      </span>
                      {project.featured && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[rgba(255,94,58,0.1)] text-[var(--color-amber)] font-bold">
                          ★ Featured
                        </span>
                      )}
                      {project.isPrivate && (
                        <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                          <Lock size={10} />
                          Private
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-base text-[var(--color-text-primary)]">
                        {project.name}
                      </h3>
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">{project.year}</span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                      {project.tagline || project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[10px]">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded bg-[var(--color-elevated)] text-[var(--color-text-secondary)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)] font-mono text-xs">
                    <div className="flex flex-col gap-0.5 mr-1">
                      <button
                        onClick={() => handleReorderProject(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleReorderProject(idx, "down")}
                        disabled={idx === projects.length - 1}
                        className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                        title="Open live app"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setCurrentProject(project);
                        setIsEditingProject(true);
                      }}
                      className="px-3 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          TAB 2: ARTICLES & DISPATCHES
          ───────────────────────────────────────────────────── */}
      {activeTab === "blogs" && (
        <div className="mt-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--color-border)] font-mono text-xs">
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "ARTICLES", "X_POSTS", ...BLOG_CATEGORIES].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                    activeFilter === category
                      ? "bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles or tags..."
                className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
              />
            </div>
          </div>

          {/* Blogs List */}
          <div className="space-y-3">
            {filteredBlogs.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                <BookOpen size={28} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
                <p className="text-sm font-bold text-[var(--color-text-primary)]">No articles or dispatches published yet</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm mx-auto">
                  Post a normal long-form article on the website or embed a live thread from X.
                </p>
                <button
                  onClick={() => handleOpenBlogEditor()}
                  className="mt-4 px-4 py-2 rounded bg-[var(--color-amber)] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Plus size={14} />
                  <span>Write First Dispatch</span>
                </button>
              </div>
            ) : (
              filteredBlogs.map((blog, idx) => {
                const isArticle = blog.type === "article" || Boolean(blog.body);
                return (
                  <div
                    key={blog.id || idx}
                    className="p-4 md:p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--color-border-bright)] shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-text-secondary)]">
                          {blog.category}
                        </span>
                        {isArticle ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-cyan)] font-semibold">
                            <FileText size={11} />
                            Article
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                            <XIcon size={11} />
                            X Post
                          </span>
                        )}
                        {blog.isPinned && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[rgba(255,94,58,0.1)] text-[var(--color-amber)]">
                            ★ Pinned
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {blog.publishedAt} · {blog.readTime}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--color-text-primary)] leading-snug">
                        {blog.title}
                      </h3>

                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                        {blog.summary}
                      </p>

                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 font-mono text-[10px]">
                          {blog.tags.map((tag) => (
                            <span key={tag} className="text-[var(--color-text-muted)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)] font-mono text-xs">
                      <div className="flex flex-col gap-0.5 mr-1">
                        <button
                          onClick={() => handleReorderBlog(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => handleReorderBlog(idx, "down")}
                          disabled={idx === blogs.length - 1}
                          className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => setPreviewingBlog(blog)}
                        className="px-2.5 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Instant preview"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>

                      {isArticle && (
                        <Link
                          href={`/blogs/${blog.slug || blog.id}`}
                          target="_blank"
                          className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                          title="Open reader page"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      )}

                      <button
                        onClick={() => handleOpenBlogEditor(blog)}
                        className="px-3 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBlog(blog.id, blog.title)}
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
                        title="Delete dispatch"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          PROJECT CREATOR / EDITOR MODAL
          ───────────────────────────────────────────────────── */}
      {isEditingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-3xl w-full my-6 p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                  {currentProject.id ? `Edit Project: ${currentProject.name}` : "Create New Project"}
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  Configure project showcase card and repositories
                </p>
              </div>
              <button
                onClick={() => setIsEditingProject(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={currentProject.name}
                    onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                    placeholder="e.g. THEUG HUB"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={currentProject.tagline}
                    onChange={(e) => setCurrentProject({ ...currentProject, tagline: e.target.value })}
                    placeholder="e.g. Decentralized identity & community hub"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={currentProject.category}
                    onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                      Status
                    </label>
                    <select
                      value={currentProject.status}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, status: e.target.value as ProjectStatus })
                      }
                      className="w-full px-2.5 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    >
                      <option value="live">Live (Active)</option>
                      <option value="wip">In Progress</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      value={currentProject.year}
                      onChange={(e) => setCurrentProject({ ...currentProject, year: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Live URL
                  </label>
                  <input
                    type="url"
                    value={currentProject.liveUrl || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={currentProject.githubUrl || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/TheUGultimatum/..."
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Banner Screenshot
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all border-[var(--color-border)] hover:border-[var(--color-amber)] bg-[var(--color-elevated)]"
                  >
                    {isUploadingImage ? (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <RefreshCw size={16} className="animate-spin text-[var(--color-amber)]" />
                        <span>Uploading image...</span>
                      </div>
                    ) : currentProject.bannerUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded overflow-hidden border border-[var(--color-border)] shrink-0 bg-black">
                          <Image
                            src={currentProject.bannerUrl}
                            alt="Banner Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-xs font-bold text-[var(--color-online)]">✓ Image Attached</div>
                          <div className="text-[10px] text-[var(--color-text-muted)] truncate">Click to replace</div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 flex flex-col items-center gap-1 text-[var(--color-text-muted)]">
                        <Upload size={16} />
                        <span>Click to upload banner image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Tech Stack (Press Enter)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={stackInput}
                      onChange={(e) => setStackInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (stackInput.trim() && !currentProject.stack.includes(stackInput.trim())) {
                            setCurrentProject((prev) => ({
                              ...prev,
                              stack: [...prev.stack, stackInput.trim()],
                            }));
                            setStackInput("");
                          }
                        }
                      }}
                      placeholder="e.g. Next.js, Rust"
                      className="flex-1 px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (stackInput.trim() && !currentProject.stack.includes(stackInput.trim())) {
                          setCurrentProject((prev) => ({
                            ...prev,
                            stack: [...prev.stack, stackInput.trim()],
                          }));
                          setStackInput("");
                        }
                      }}
                      className="px-3 py-2 rounded bg-[var(--color-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentProject.stack.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-elevated)] text-[var(--color-text-secondary)] flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentProject((prev) => ({
                              ...prev,
                              stack: prev.stack.filter((s) => s !== tag),
                            }))
                          }
                          className="hover:text-[var(--color-error)] ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={currentProject.description}
                    onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                    placeholder="Short architectural overview..."
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded bg-[var(--color-elevated)] border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.featured}
                      onChange={(e) => setCurrentProject({ ...currentProject, featured: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs">★ Featured / Spotlight</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.isPrivate}
                      onChange={(e) => setCurrentProject({ ...currentProject, isPrivate: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs">Private Repo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditingProject(false)}
                className="px-4 py-2 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                className="px-6 py-2 rounded bg-[var(--color-amber)] text-black font-bold text-xs tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <Save size={13} />
                <span>Save Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          BLOG / ARTICLE CREATOR MODAL
          ───────────────────────────────────────────────────── */}
      {isEditingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full my-6 p-6 md:p-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-h-[92vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                  {currentBlog.id ? `Edit: ${currentBlog.title}` : "Write New Dispatch or Article"}
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  Publish a full article directly on the website, or embed an X thread preview.
                </p>
              </div>
              <button
                onClick={() => setIsEditingBlog(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] px-2 py-1 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Type Switcher: Article vs X Post */}
            <div className="flex items-center gap-2 mt-4 p-1.5 rounded-lg bg-[var(--color-elevated)] border border-[var(--color-border)] w-fit">
              <button
                type="button"
                onClick={() => setCurrentBlog({ ...currentBlog, type: "article" })}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentBlog.type === "article" || (!currentBlog.type && currentBlog.body)
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-bold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <FileText size={13} />
                <span>Full Website Article</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentBlog({ ...currentBlog, type: "x-post" })}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentBlog.type === "x-post" && !currentBlog.body
                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-bold"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <XIcon size={13} />
                <span>X Post / Thread Embed</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {/* Left Column: Form Fields */}
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={currentBlog.title}
                    onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                    placeholder="e.g. Architectural Breakdown of On-Chain Convictions"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                {/* X URL with Auto Preview Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-[var(--color-text-secondary)] font-semibold">
                      Link to X Thread / Post {currentBlog.type === "x-post" ? "*" : "(Optional)"}
                    </label>
                    <span className="text-[10px] text-[var(--color-amber)]">
                      Auto-fill from X URL
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentBlog.url || ""}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, url: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAutoFetchLink();
                        }
                      }}
                      placeholder="https://x.com/Usmaangani252/status/..."
                      className="flex-1 px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoFetchLink()}
                      disabled={isFetchingPreview}
                      className="px-3 py-2 rounded bg-[rgba(255,94,58,0.12)] border border-[var(--color-amber)] text-[var(--color-amber)] hover:bg-[var(--color-amber)] hover:text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                      title="Fetch title, summary, hashtags, and content from the link"
                    >
                      {isFetchingPreview ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>⚡ Auto-Fill</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                      Category
                    </label>
                    <select
                      value={currentBlog.category}
                      onChange={(e) =>
                        setCurrentBlog({
                          ...currentBlog,
                          category: e.target.value as XPost["category"],
                        })
                      }
                      className="w-full px-2.5 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    >
                      {BLOG_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                      Read Time / Format
                    </label>
                    <input
                      type="text"
                      value={currentBlog.readTime}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, readTime: e.target.value })}
                      placeholder="e.g. 4 min read"
                      className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Executive Summary / Excerpt (Lead sentence)
                  </label>
                  <textarea
                    rows={2}
                    value={currentBlog.summary}
                    onChange={(e) => setCurrentBlog({ ...currentBlog, summary: e.target.value })}
                    placeholder="Brief hook or thesis statement summarizing the article..."
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                {/* Full Article Body for Normal Articles */}
                {(currentBlog.type === "article" || currentBlog.body !== undefined) && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[var(--color-text-secondary)] font-semibold">
                        Full Article Body (Markdown supported)
                      </label>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        Use ## for headings, separate with empty lines
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={currentBlog.body || ""}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, body: e.target.value })}
                      placeholder="Write your full article here directly...&#10;&#10;## Key Concept&#10;Explain in detail with code or examples...&#10;&#10;Conclusion..."
                      className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] font-mono leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Tags, Highlights & Live Preview */}
              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Core Highlights / Takeaways (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={highlightsInput}
                    onChange={(e) => setHighlightsInput(e.target.value)}
                    placeholder="Takeaway 1&#10;Takeaway 2&#10;Takeaway 3"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--color-text-secondary)] font-semibold mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="#Web3, #Base, #Solidity"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-[var(--color-elevated)] border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(currentBlog.isPinned)}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, isPinned: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs font-semibold">★ Pin to Top of Dispatches</span>
                  </label>
                </div>

                {/* Real-Time Live Preview Card */}
                <div className="mt-1 p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)]">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--color-border)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-amber)] flex items-center gap-1.5">
                      <Eye size={12} />
                      <span>Live Card Preview</span>
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {currentBlog.type === "article" || currentBlog.body ? "Article Mode" : "X Post Mode"}
                    </span>
                  </div>

                  <article className="p-3.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                          {currentBlog.category || "Web3"}
                        </span>
                        {currentBlog.isPinned && (
                          <span className="text-[9px] text-[var(--color-amber)] font-bold">
                            ★ Featured
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {currentBlog.publishedAt || "Nov 2026"} · {currentBlog.readTime || "3 min read"}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--color-text-primary)] mb-1 leading-snug">
                      {currentBlog.title || "Dispatch Title Will Appear Here"}
                    </h4>

                    <p className="text-xs text-[var(--color-text-secondary)] mb-2 line-clamp-2 leading-relaxed">
                      {currentBlog.summary || "Summary preview will appear here..."}
                    </p>

                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between mt-2 font-mono text-[11px]">
                      <span className="text-[var(--color-text-muted)]">@Usmaangani252</span>
                      <span className="text-[var(--color-amber)] font-semibold flex items-center gap-1">
                        <span>{currentBlog.type === "article" || currentBlog.body ? "Read Article" : "View on X"}</span>
                        <ArrowUpRight size={11} />
                      </span>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditingBlog(false)}
                className="px-4 py-2 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                className="px-6 py-2 rounded bg-[var(--color-amber)] text-black font-bold text-xs tracking-wider flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <Save size={13} />
                <span>Publish Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          QUICK PREVIEW MODAL
          ───────────────────────────────────────────────────── */}
      {previewingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]">
                Live Card Preview
              </span>
              <button
                onClick={() => setPreviewingBlog(null)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <article className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-elevated)]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  {previewingBlog.category}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {previewingBlog.publishedAt} · {previewingBlog.readTime}
                </span>
              </div>

              <h3 className="font-bold text-base text-[var(--color-text-primary)] mb-1 leading-snug">
                {previewingBlog.title}
              </h3>

              <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed">
                {previewingBlog.summary}
              </p>

              {previewingBlog.highlights && previewingBlog.highlights.length > 0 && (
                <ul className="mb-3 space-y-1 border-l-2 border-[var(--color-border)] pl-2.5">
                  {previewingBlog.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-muted)]">
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                <button
                  onClick={() => {
                    const toEdit = previewingBlog;
                    setPreviewingBlog(null);
                    handleOpenBlogEditor(toEdit);
                  }}
                  className="px-3 py-1.5 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Edit
                </button>

                {previewingBlog.type === "article" || previewingBlog.body ? (
                  <Link
                    href={`/blogs/${previewingBlog.slug || previewingBlog.id}`}
                    target="_blank"
                    className="px-3.5 py-1.5 rounded bg-[var(--color-amber)] text-black font-bold text-xs flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight size={12} />
                  </Link>
                ) : (
                  <a
                    href={previewingBlog.url || "https://x.com/Usmaangani252"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded bg-[var(--color-amber)] text-black font-bold text-xs flex items-center gap-1"
                  >
                    <span>View on X</span>
                    <ArrowUpRight size={12} />
                  </a>
                )}
              </div>
            </article>
          </div>
        </div>
      )}
    </div>
  );
}
