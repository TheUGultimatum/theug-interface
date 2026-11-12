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
} from "lucide-react";

const PRESET_COLORS = [
  { label: "High-Heat Amber", color: "var(--color-amber)", rgb: "255,94,58" },
  { label: "Cyan Circuit", color: "var(--color-cyan)", rgb: "0,212,255" },
  { label: "Electric Blue", color: "var(--color-electric)", rgb: "68,136,255" },
  { label: "Matrix Purple", color: "var(--color-purple)", rgb: "136,85,255" },
  { label: "Acid Green", color: "#44d62c", rgb: "68,214,44" },
];

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
  title: "",
  url: "https://x.com/Usmaangani252",
  publishedAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  readTime: "3 min read · Thread",
  category: "Web3",
  summary: "",
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

  // Multi-factor credentials state
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
  const [contentInput, setContentInput] = useState<string>("");
  const [isFetchingPreview, setIsFetchingPreview] = useState<boolean>(false);
  const [previewingBlog, setPreviewingBlog] = useState<XPost | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeProjectFilter, setActiveProjectFilter] = useState<string>("ALL");
  const [activeBlogFilter, setActiveBlogFilter] = useState<string>("ALL");

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
        notify("Access Granted: Admin Clearance Verified", "success");
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
    setTimeout(() => setStatusMessage(null), 4500);
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
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
        notify(`Project "${name}" removed`);
      } else {
        notify(data.error || "Failed to delete project", "error");
      }
    } catch {
      notify("Network error while deleting project", "error");
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
      notify("Project order updated");
    } catch {
      notify("Failed to persist order", "error");
    }
  };

  const handleExportProjectsJson = () => {
    const jsonStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theug-projects-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Downloaded projects.json backup");
  };

  /* ─────────────────────────────────────────────────────────
     BLOG / DISPATCH ACTIONS
     ───────────────────────────────────────────────────────── */
  const handleOpenBlogEditor = (blog?: XPost) => {
    if (blog) {
      setCurrentBlog(blog);
      setHighlightsInput((blog.highlights || []).join("\n"));
      setTagsInput((blog.tags || []).join(", "));
      setContentInput((blog.content || []).join("\n\n"));
    } else {
      setCurrentBlog(EMPTY_BLOG);
      setHighlightsInput("");
      setTagsInput("#Web3");
      setContentInput("");
    }
    setIsEditingBlog(true);
  };

  const handleAutoFetchLink = async (customUrl?: string) => {
    const targetUrl = customUrl || currentBlog.url;
    if (!targetUrl || !targetUrl.trim() || targetUrl.trim() === "https://x.com/Usmaangani252") {
      notify("Please enter a specific post or article URL to preview", "error");
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
          content: data.content && data.content.length > 0 ? data.content : prev.content,
        }));

        if (data.tags && data.tags.length > 0 && (!tagsInput || tagsInput === "#Web3")) {
          setTagsInput(data.tags.join(", "));
        }

        if (data.content && data.content.length > 1 && !highlightsInput) {
          setHighlightsInput(data.content.slice(1, 4).join("\n"));
        }

        notify("⚡ Auto-preview fetched! Details populated.");
      } else {
        notify(data.error || "Could not fetch link metadata", "error");
      }
    } catch {
      notify("Network error while fetching preview", "error");
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleSaveBlog = async () => {
    if (!currentBlog.title.trim()) {
      notify("Dispatch title is required", "error");
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

    const content = contentInput
      .split("\n\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const blogToSave: XPost = {
      ...currentBlog,
      id:
        currentBlog.id.trim() ||
        currentBlog.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      url: currentBlog.url.trim() || "https://x.com/Usmaangani252",
      highlights,
      tags,
      content,
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
        notify(`Dispatch "${blogToSave.title}" published!`);
      } else {
        notify(data.error || "Failed to save dispatch", "error");
      }
    } catch {
      notify("Network error while saving dispatch", "error");
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete dispatch "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
        notify(`Dispatch "${title}" removed`);
      } else {
        notify(data.error || "Failed to delete dispatch", "error");
      }
    } catch {
      notify("Network error while deleting dispatch", "error");
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
      notify("Dispatch order updated");
    } catch {
      notify("Failed to persist dispatch order", "error");
    }
  };

  const handleExportBlogsJson = () => {
    const jsonStr = JSON.stringify(blogs, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `theug-blogs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Downloaded blogs.json backup");
  };

  // Filtered queries
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.stack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      activeProjectFilter === "ALL" ||
      (activeProjectFilter === "FEATURED" && p.featured) ||
      (activeProjectFilter === "LIVE" && p.status === "live") ||
      (activeProjectFilter === "PRIVATE" && p.isPrivate);
    return matchesSearch && matchesFilter;
  });

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      activeBlogFilter === "ALL" || b.category === activeBlogFilter;
    return matchesSearch && matchesFilter;
  });

  /* ─────────────────────────────────────────────────────────
     LOGIN GATE
     ───────────────────────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div
          className="panel max-w-lg w-full p-8 relative overflow-hidden"
          style={{
            border: "1px solid var(--color-border-bright)",
            background: "linear-gradient(180deg, rgba(16,16,20,0.96) 0%, rgba(8,8,12,0.99) 100%)",
            boxShadow: "0 12px 48px rgba(0,0,0,0.9), 0 0 32px rgba(255,94,58,0.08)",
          }}
        >
          <div className="flex items-center gap-3.5 pb-5 border-b border-[var(--color-border)]">
            <div className="p-2.5 rounded-lg bg-[rgba(255,94,58,0.12)] text-[var(--color-amber)] border border-[rgba(255,94,58,0.3)] shadow-[0_0_12px_rgba(255,94,58,0.2)]">
              <Shield size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-amber)] animate-pulse" />
                <h1 className="font-mono text-sm tracking-widest text-[var(--color-text-primary)] font-bold">
                  SYS.ADMIN // MULTI-FACTOR CLEARANCE
                </h1>
              </div>
              <p className="font-mono text-[9px] text-[var(--color-text-muted)] tracking-wider mt-0.5">
                SECURE IDENTITY VERIFICATION GATEWAY
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <UserCheck size={12} className="text-[var(--color-cyan)]" />
                  ADMIN IDENTIFIER / USERNAME
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)]">DEFAULT: theug</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="theug"
                className="w-full px-3.5 py-2.5 font-mono text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-cyan)] text-[var(--color-text-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Lock size={12} className="text-[var(--color-amber)]" />
                  SECURITY PASSPHRASE
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)]">DEFAULT: theug-ultimatum-2026</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 font-mono text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-amber)] text-[var(--color-text-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <KeyRound size={12} className="text-[var(--color-purple)]" />
                  6-DIGIT CLEARANCE PIN
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)]">DEFAULT: 252252</span>
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="252252"
                className="w-full px-3.5 py-2.5 font-mono text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded focus:outline-none focus:border-[var(--color-purple)] text-[var(--color-text-primary)] tracking-widest transition-colors"
              />
            </div>

            {authError && (
              <div className="p-3 rounded bg-[rgba(255,51,51,0.12)] border border-[rgba(255,51,51,0.3)] flex items-center gap-2.5 text-[var(--color-error)] font-mono text-[10px] animate-shake">
                <AlertCircle size={15} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoadingAuth}
              className="mt-3 py-3 px-4 rounded bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-amber-bright)] text-black font-mono font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(255,94,58,0.3)]"
            >
              {isLoadingAuth ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  VERIFYING HARDWARE KEYS...
                </>
              ) : (
                <>
                  <Shield size={15} />
                  AUTHENTICATE & UNLOCK CONSOLE
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between font-mono text-[9px] text-[var(--color-text-muted)]">
            <Link href="/" className="hover:text-[var(--color-amber)] transition-colors flex items-center gap-1">
              ← Return to portfolio
            </Link>
            <span className="text-[var(--color-online)]">SHA-256 HMAC ACTIVE</span>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     AUTHENTICATED ADMIN CONSOLE
     ───────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen px-4 md:px-8 py-8 max-w-[1400px] mx-auto font-mono pb-24">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-5 py-3.5 rounded border shadow-2xl flex items-center gap-3 text-xs tracking-wide transition-all ${
            statusMessage.type === "success"
              ? "bg-[rgba(10,24,18,0.96)] border-[#00d9ff]/50 text-[#00d9ff] shadow-[0_0_24px_rgba(0,217,255,0.2)]"
              : "bg-[rgba(28,10,10,0.96)] border-[var(--color-error)]/50 text-[var(--color-error)] shadow-[0_0_24px_rgba(255,51,51,0.2)]"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-online)] animate-pulse" />
            <span className="text-[10px] text-[var(--color-online)] tracking-widest uppercase font-bold">
              SYS.ADMIN // CLEARANCE ACTIVE (THEUG ARCHITECT)
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] tracking-wider mt-1">
            PORTFOLIO COMMAND CONSOLE
          </h1>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Manage live Web3 projects, code repositories, and authentic X dispatches
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={activeTab === "projects" ? "/projects" : "/blogs"}
            target="_blank"
            className="px-3.5 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-cyan)] text-[var(--color-text-secondary)] hover:text-[var(--color-cyan)] text-xs flex items-center gap-1.5 transition-all"
          >
            <Eye size={14} />
            <span>VIEW LIVE {activeTab.toUpperCase()}</span>
          </Link>

          <button
            onClick={activeTab === "projects" ? handleExportProjectsJson : handleExportBlogsJson}
            className="px-3.5 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-amber)] text-[var(--color-text-secondary)] hover:text-[var(--color-amber)] text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>EXPORT JSON</span>
          </button>

          <button
            onClick={handleLogout}
            title="Log out"
            className="px-3 py-2 rounded border border-[var(--color-border)] hover:border-[var(--color-error)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <LogOut size={14} />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          TAB SWITCHER: PROJECTS vs BLOGS
          ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-6 border-b border-[var(--color-border)] pb-3">
        <button
          onClick={() => {
            setActiveTab("projects");
            setSearchQuery("");
          }}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "projects"
              ? "bg-[var(--color-amber)] text-black shadow-[0_0_16px_rgba(255,94,58,0.35)]"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
          }`}
        >
          <FolderOpen size={15} />
          <span>PROJECTS INVENTORY ({projects.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("blogs");
            setSearchQuery("");
          }}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "blogs"
              ? "bg-[var(--color-amber)] text-black shadow-[0_0_16px_rgba(255,94,58,0.35)]"
              : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
          }`}
        >
          <BookOpen size={15} />
          <span>BLOGS & DISPATCHES ({blogs.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────
          TAB 1: PROJECTS SECTION
          ───────────────────────────────────────────────────── */}
      {activeTab === "projects" && (
        <>
          {/* Hero Banner */}
          <div className="my-6 p-6 rounded-xl border border-[rgba(255,94,58,0.3)] bg-gradient-to-r from-[rgba(255,94,58,0.08)] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[var(--color-amber)] text-[10px] tracking-widest font-bold">
                <Sparkles size={14} />
                <span>PROJECT INVENTORY</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mt-1">
                Feature a build, site, or decentralized node
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xl">
                Upload screenshots, configure tech stack tags, set GitHub links, and publish to your portfolio.
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentProject(EMPTY_PROJECT);
                setIsEditingProject(true);
              }}
              className="shrink-0 px-6 py-3 rounded-lg bg-[var(--color-amber)] text-black font-mono font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(255,94,58,0.3)]"
            >
              <Plus size={16} strokeWidth={3} />
              <span>+ CREATE NEW PROJECT</span>
            </button>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
            {[
              { label: "TOTAL INVENTORY", value: projects.length, color: "var(--color-cyan)" },
              { label: "LIVE APPS", value: projects.filter((p) => p.status === "live").length, color: "var(--color-online)" },
              { label: "SPOTLIGHTS", value: projects.filter((p) => p.featured).length, color: "var(--color-amber)" },
              { label: "PRIVATE REPOS", value: projects.filter((p) => p.isPrivate).length, color: "var(--color-purple)" },
            ].map((m, idx) => (
              <div
                key={idx}
                className="panel p-3.5 flex flex-col justify-between"
                style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
              >
                <span className="text-[9px] text-[var(--color-text-muted)] tracking-wider">{m.label}</span>
                <span className="text-xl font-bold mt-1" style={{ color: m.color }}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-6 pb-4 border-b border-[var(--color-border)]">
            <div className="flex flex-wrap gap-2">
              {["ALL", "LIVE", "FEATURED", "PRIVATE"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveProjectFilter(filter)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                    activeProjectFilter === filter
                      ? "bg-[var(--color-text-primary)] text-black font-bold"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="flex flex-col gap-3">
            {filteredProjects.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[var(--color-border)] rounded-lg">
                <p className="text-sm text-[var(--color-text-muted)]">No projects match the selected criteria.</p>
              </div>
            ) : (
              filteredProjects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="panel p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--color-border-bright)]"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderLeft: `4px solid rgb(${project.accentRgb})`,
                  }}
                >
                  {project.bannerUrl && (
                    <div className="relative w-24 h-16 rounded overflow-hidden border border-white/10 shrink-0 bg-black hidden sm:block">
                      <Image
                        src={project.bannerUrl}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] tracking-wider">
                        {project.category}
                      </span>
                      <span className="text-[var(--color-text-ghost)]">•</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold"
                        style={{
                          color: `rgb(${project.accentRgb})`,
                          background: `rgba(${project.accentRgb},0.08)`,
                          border: `1px solid rgba(${project.accentRgb},0.25)`,
                        }}
                      >
                        {project.status}
                      </span>
                      {project.featured && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-[rgba(255,94,58,0.12)] text-[var(--color-amber)] border border-[rgba(255,94,58,0.3)] flex items-center gap-1 font-bold">
                          ★ FEATURED
                        </span>
                      )}
                      {project.isPrivate && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-[var(--color-text-muted)] border border-white/10 flex items-center gap-1">
                          <Lock size={10} className="text-[var(--color-amber)]" />
                          PRIVATE REPO
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h3 className="text-sm md:text-base font-bold text-[var(--color-text-primary)] truncate">
                        {project.name}
                      </h3>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{project.year}</span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-1">
                      {project.tagline || project.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-1.5 py-0.5 text-[9px] rounded bg-[var(--color-void)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                    <div className="flex flex-col gap-0.5 mr-2">
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
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-cyan)] hover:border-[var(--color-cyan)] transition-colors"
                        title="Open live app"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-amber)] hover:border-[var(--color-amber)] transition-colors"
                        title="Open repository"
                      >
                        <Code2 size={14} />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setCurrentProject(project);
                        setIsEditingProject(true);
                      }}
                      className="px-3 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>EDIT</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────
          TAB 2: BLOGS & DISPATCHES SECTION
          ───────────────────────────────────────────────────── */}
      {activeTab === "blogs" && (
        <>
          {/* Hero Banner */}
          <div className="my-6 p-6 rounded-xl border border-[rgba(0,217,255,0.3)] bg-gradient-to-r from-[rgba(0,217,255,0.08)] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[var(--color-cyan)] text-[10px] tracking-widest font-bold">
                <BookOpen size={14} />
                <span>DISPATCHES ARCHIVE</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mt-1">
                Post an article, X thread preview, or alpha breakdown
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xl">
                Add your real dispatches from @Usmaangani252 with custom key takeaways, category tags, and direct links to X.
              </p>
            </div>

            <button
              onClick={() => handleOpenBlogEditor()}
              className="shrink-0 px-6 py-3 rounded-lg bg-[var(--color-amber)] text-black font-mono font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(255,94,58,0.3)]"
            >
              <Plus size={16} strokeWidth={3} />
              <span>+ WRITE NEW DISPATCH</span>
            </button>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
            {[
              { label: "TOTAL DISPATCHES", value: blogs.length, color: "var(--color-cyan)" },
              { label: "WEB3 ESSAYS", value: blogs.filter((b) => b.category === "Web3").length, color: "var(--color-online)" },
              { label: "AI & AGENTS", value: blogs.filter((b) => b.category === "AI & Agents").length, color: "var(--color-amber)" },
              { label: "PINNED TO TOP", value: blogs.filter((b) => b.isPinned).length, color: "var(--color-purple)" },
            ].map((m, idx) => (
              <div
                key={idx}
                className="panel p-3.5 flex flex-col justify-between"
                style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}
              >
                <span className="text-[9px] text-[var(--color-text-muted)] tracking-wider">{m.label}</span>
                <span className="text-xl font-bold mt-1" style={{ color: m.color }}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-6 pb-4 border-b border-[var(--color-border)]">
            <div className="flex flex-wrap gap-2">
              {["ALL", ...BLOG_CATEGORIES].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveBlogFilter(category)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors cursor-pointer ${
                    activeBlogFilter === category
                      ? "bg-[var(--color-text-primary)] text-black font-bold"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dispatches..."
                className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
              />
            </div>
          </div>

          {/* Blogs List */}
          <div className="flex flex-col gap-3">
            {filteredBlogs.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[var(--color-border)] rounded-lg">
                <BookOpen size={28} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-40" />
                <p className="text-sm font-bold text-[var(--color-text-primary)]">No dispatches published yet</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm mx-auto">
                  Click the button below to add your first post or thread from @Usmaangani252.
                </p>
                <button
                  onClick={() => handleOpenBlogEditor()}
                  className="mt-4 px-4 py-2 rounded bg-[var(--color-amber)] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Write First Dispatch</span>
                </button>
              </div>
            ) : (
              filteredBlogs.map((blog, idx) => (
                <div
                  key={blog.id || idx}
                  className="panel p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--color-border-bright)]"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderLeft: blog.isPinned ? "4px solid var(--color-amber)" : "4px solid var(--color-cyan)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-secondary)]">
                        {blog.category}
                      </span>
                      {blog.isPinned && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[rgba(255,94,58,0.12)] text-[var(--color-amber)] border border-[rgba(255,94,58,0.3)] flex items-center gap-1">
                          <Pin size={10} className="fill-current" />
                          PINNED
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
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {blog.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-[var(--color-text-muted)] font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                    <div className="flex flex-col gap-0.5 mr-2">
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

                    {blog.url && (
                      <a
                        href={blog.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-amber)] hover:border-[var(--color-amber)] transition-colors"
                        title="View thread on X"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <button
                      onClick={() => setPreviewingBlog(blog)}
                      className="px-2.5 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Instant preview"
                    >
                      <Eye size={13} />
                      <span>PREVIEW</span>
                    </button>

                    <button
                      onClick={() => handleOpenBlogEditor(blog)}
                      className="px-3 py-1.5 rounded border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>EDIT</span>
                    </button>

                    <button
                      onClick={() => handleDeleteBlog(blog.id, blog.title)}
                      className="p-2 rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
                      title="Delete dispatch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────
          PROJECT EDITOR MODAL
          ───────────────────────────────────────────────────── */}
      {isEditingProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="panel max-w-4xl w-full my-6 p-6 md:p-8 relative max-h-[92vh] overflow-y-auto"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-bright)",
              boxShadow: "0 16px 64px rgba(0,0,0,0.95), 0 0 32px rgba(0,212,255,0.1)",
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-[rgba(255,94,58,0.15)] text-[var(--color-amber)]">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-bold text-[var(--color-text-primary)] tracking-wider">
                    {currentProject.id ? `EDIT // ${currentProject.name}` : "CREATE NEW PROJECT"}
                  </h2>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Configure details, banner image, and visibility
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProject(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm px-2 py-1 cursor-pointer"
              >
                ✕ CANCEL
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    PROJECT NAME *
                  </label>
                  <input
                    type="text"
                    value={currentProject.name}
                    onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                    placeholder="e.g. THEUG HUB"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    TAGLINE
                  </label>
                  <input
                    type="text"
                    value={currentProject.tagline}
                    onChange={(e) => setCurrentProject({ ...currentProject, tagline: e.target.value })}
                    placeholder="e.g. Decentralized identity & community hub"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={currentProject.description}
                    onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                    placeholder="Details about architecture, purpose, and problems solved..."
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                      CATEGORY
                    </label>
                    <select
                      value={currentProject.category}
                      onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                      className="w-full px-2.5 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                    >
                      {PRESET_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                      STATUS
                    </label>
                    <select
                      value={currentProject.status}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, status: e.target.value as ProjectStatus })
                      }
                      className="w-full px-2.5 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                    >
                      <option value="live">LIVE [ ● ACTIVE ]</option>
                      <option value="wip">WIP [ ◑ IN PROGRESS ]</option>
                      <option value="archived">ARCHIVED [ ○ OFF ]</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                      DEPLOY TARGET
                    </label>
                    <input
                      type="text"
                      value={currentProject.deployTarget || ""}
                      onChange={(e) => setCurrentProject({ ...currentProject, deployTarget: e.target.value })}
                      placeholder="e.g. VERCEL, VPS, BASE"
                      className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                      YEAR
                    </label>
                    <input
                      type="text"
                      value={currentProject.year}
                      onChange={(e) => setCurrentProject({ ...currentProject, year: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    LIVE URL
                  </label>
                  <input
                    type="url"
                    value={currentProject.liveUrl || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, liveUrl: e.target.value })}
                    placeholder="https://yourproject.com"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    GITHUB REPOSITORY URL
                  </label>
                  <input
                    type="url"
                    value={currentProject.githubUrl || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/TheUGultimatum/..."
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    PROJECT BANNER / SCREENSHOT
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
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all border-[var(--color-border)] hover:border-[var(--color-amber)]"
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <RefreshCw size={20} className="text-[var(--color-cyan)] animate-spin" />
                        <span className="text-[11px] text-[var(--color-cyan)]">UPLOADING IMAGE...</span>
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
                          <div className="text-[11px] text-[var(--color-online)] font-bold truncate">
                            ✓ Image Active
                          </div>
                          <div className="text-[9px] text-[var(--color-text-secondary)] hover:underline">
                            Click to replace image
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                        <Upload size={16} className="text-[var(--color-text-muted)]" />
                        <span className="text-[11px] text-[var(--color-text-primary)] font-bold">
                          Upload banner screenshot
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    TECH STACK MODULES
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
                      placeholder="e.g. Next.js, Rust (Press Enter)"
                      className="flex-1 px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
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
                      className="px-3 py-2 rounded bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-cyan)] text-xs text-[var(--color-cyan)] cursor-pointer"
                    >
                      ADD
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentProject.stack.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-void)] border border-[var(--color-border)] text-[var(--color-text-secondary)] flex items-center gap-1"
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
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    ACCENT COLOR
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((col) => {
                      const isSelected = currentProject.accentRgb === col.rgb;
                      return (
                        <button
                          key={col.label}
                          type="button"
                          onClick={() =>
                            setCurrentProject({
                              ...currentProject,
                              accentColor: col.color,
                              accentRgb: col.rgb,
                            })
                          }
                          className={`px-2.5 py-1.5 rounded text-[10px] flex items-center gap-1.5 border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[var(--color-text-primary)] bg-[var(--color-elevated)] font-bold shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                              : "border-[var(--color-border)] hover:border-[var(--color-border-bright)]"
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: `rgb(${col.rgb})` }}
                          />
                          <span>{col.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded bg-[var(--color-void)] border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.featured}
                      onChange={(e) => setCurrentProject({ ...currentProject, featured: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs text-[var(--color-text-primary)]">★ Spotlight / Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.isPrivate}
                      onChange={(e) => setCurrentProject({ ...currentProject, isPrivate: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs text-[var(--color-text-primary)]">Private Repository</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditingProject(false)}
                className="px-4 py-2.5 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                className="px-6 py-2.5 rounded bg-[var(--color-amber)] text-black font-bold text-xs tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,94,58,0.3)]"
              >
                <Save size={14} />
                <span>SAVE & PUBLISH PROJECT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          BLOG / DISPATCH EDITOR MODAL
          ───────────────────────────────────────────────────── */}
      {isEditingBlog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="panel max-w-4xl w-full my-6 p-6 md:p-8 relative max-h-[92vh] overflow-y-auto"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-bright)",
              boxShadow: "0 16px 64px rgba(0,0,0,0.95), 0 0 32px rgba(255,94,58,0.15)",
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-[rgba(255,94,58,0.15)] text-[var(--color-amber)]">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-bold text-[var(--color-text-primary)] tracking-wider">
                    {currentBlog.id ? `EDIT // ${currentBlog.title}` : "WRITE NEW DISPATCH"}
                  </h2>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    Publish an authentic technical note or thread from @Usmaangani252
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingBlog(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm px-2 py-1 cursor-pointer"
              >
                ✕ CANCEL
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Left Column: Form Fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    DISPATCH TITLE *
                  </label>
                  <input
                    type="text"
                    value={currentBlog.title}
                    onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                    placeholder="e.g. The Architecture Behind My Web3 Convictions"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-[var(--color-text-secondary)] font-bold">
                      LINK TO POST ON X OR ARTICLE *
                    </label>
                    <span className="text-[9px] text-[var(--color-amber)]">
                      Paste URL & click Auto Preview
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentBlog.url}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, url: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAutoFetchLink();
                        }
                      }}
                      placeholder="https://x.com/Usmaangani252/status/... or article URL"
                      className="flex-1 px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAutoFetchLink()}
                      disabled={isFetchingPreview}
                      className="px-3.5 py-2 rounded bg-[rgba(255,94,58,0.15)] border border-[var(--color-amber)] text-[var(--color-amber)] hover:bg-[var(--color-amber)] hover:text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      title="Fetch title, summary, hashtags, and preview from the URL"
                    >
                      {isFetchingPreview ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>FETCHING...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} />
                          <span>AUTO PREVIEW</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                      CATEGORY
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
                    <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                      READ TIME / FORMAT
                    </label>
                    <input
                      type="text"
                      value={currentBlog.readTime}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, readTime: e.target.value })}
                      placeholder="e.g. 3 min read · Thread"
                      className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    PUBLICATION DATE
                  </label>
                  <input
                    type="text"
                    value={currentBlog.publishedAt}
                    onChange={(e) => setCurrentBlog({ ...currentBlog, publishedAt: e.target.value })}
                    placeholder="e.g. Nov 2026"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    EXECUTIVE SUMMARY (1-2 SENTENCES)
                  </label>
                  <textarea
                    rows={3}
                    value={currentBlog.summary}
                    onChange={(e) => setCurrentBlog({ ...currentBlog, summary: e.target.value })}
                    placeholder="Brief hook or thesis statement summarizing the dispatch..."
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>
              </div>

              {/* Right Column: Content & Live Preview */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    CORE TAKEAWAYS / BULLETS (ONE PER LINE)
                  </label>
                  <textarea
                    rows={3}
                    value={highlightsInput}
                    onChange={(e) => setHighlightsInput(e.target.value)}
                    placeholder="Key takeaway 1&#10;Key takeaway 2&#10;Key takeaway 3"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="#Web3, #Solidity, #Base"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] text-[var(--color-text-muted)] mb-1">
                      LIKES (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={currentBlog.stats?.likes || ""}
                      onChange={(e) =>
                        setCurrentBlog({
                          ...currentBlog,
                          stats: { ...currentBlog.stats, likes: e.target.value },
                        })
                      }
                      placeholder="e.g. 142"
                      className="w-full px-2.5 py-1.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-[var(--color-text-muted)] mb-1">
                      REPOSTS
                    </label>
                    <input
                      type="text"
                      value={currentBlog.stats?.reposts || ""}
                      onChange={(e) =>
                        setCurrentBlog({
                          ...currentBlog,
                          stats: { ...currentBlog.stats, reposts: e.target.value },
                        })
                      }
                      placeholder="e.g. 28"
                      className="w-full px-2.5 py-1.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-[var(--color-text-muted)] mb-1">
                      VIEWS
                    </label>
                    <input
                      type="text"
                      value={currentBlog.stats?.views || ""}
                      onChange={(e) =>
                        setCurrentBlog({
                          ...currentBlog,
                          stats: { ...currentBlog.stats, views: e.target.value },
                        })
                      }
                      placeholder="e.g. 4.8K"
                      className="w-full px-2.5 py-1.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)]"
                    />
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--color-void)] border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(currentBlog.isPinned)}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, isPinned: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs text-[var(--color-text-primary)]">
                      Pin to Top of Dispatches Archive
                    </span>
                  </label>
                </div>

                {/* Real-Time Live Preview Card inside Editor */}
                <div className="p-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-void)]">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--color-border)]">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-amber)] flex items-center gap-1.5">
                      <Eye size={12} />
                      <span>LIVE DISPATCH PREVIEW</span>
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)] font-mono">
                      (Live look on /blogs)
                    </span>
                  </div>

                  <article className="p-3.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)]">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                          {currentBlog.category || "Web3"}
                        </span>
                        {currentBlog.isPinned && (
                          <span className="text-[9px] text-[var(--color-amber)] flex items-center gap-1">
                            <Pin size={9} className="fill-current" />
                            Pinned
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
                      {currentBlog.summary || "Summary or excerpt preview..."}
                    </p>

                    {highlightsInput && (
                      <ul className="mb-2 space-y-1 border-l border-[var(--color-border)] pl-2">
                        {highlightsInput
                          .split("\n")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((h, i) => (
                            <li key={i} className="text-[10px] text-[var(--color-text-muted)] truncate">
                              {h}
                            </li>
                          ))}
                      </ul>
                    )}

                    <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--color-text-muted)]">
                        {currentBlog.stats?.likes && <span>❤️ {currentBlog.stats.likes}</span>}
                        {currentBlog.stats?.reposts && <span>🔁 {currentBlog.stats.reposts}</span>}
                        {currentBlog.stats?.views && <span>👁️ {currentBlog.stats.views}</span>}
                      </div>
                      <span className="text-[10px] text-[var(--color-amber)] font-mono flex items-center gap-1">
                        <span>Read on X</span>
                        <ArrowUpRight size={11} />
                      </span>
                    </div>
                  </article>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditingBlog(false)}
                className="px-4 py-2.5 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                className="px-6 py-2.5 rounded bg-[var(--color-amber)] text-black font-bold text-xs tracking-wider flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,94,58,0.3)]"
              >
                <Save size={14} />
                <span>SAVE & PUBLISH DISPATCH</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          QUICK DISPATCH PREVIEW MODAL
          ───────────────────────────────────────────────────── */}
      {previewingBlog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="panel max-w-lg w-full p-6 relative"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-bright)",
              boxShadow: "0 16px 64px rgba(0,0,0,0.95), 0 0 32px rgba(0,217,255,0.15)",
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-[var(--color-cyan)]" />
                <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]">
                  DISPATCH CARD LIVE PREVIEW
                </span>
              </div>
              <button
                onClick={() => setPreviewingBlog(null)}
                className="text-[var(--color-text-muted)] hover:text-white text-xs px-2 py-1 cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            <article className="p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-void)]">
              <div className="flex items-center justify-between text-xs mb-2 font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                    {previewingBlog.category}
                  </span>
                  {previewingBlog.isPinned && (
                    <span className="text-[10px] text-[var(--color-amber)] flex items-center gap-1 font-semibold">
                      <Pin size={10} className="fill-current" />
                      Pinned
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {previewingBlog.publishedAt} · {previewingBlog.readTime}
                </span>
              </div>

              <h3 className="font-bold text-base text-[var(--color-text-primary)] mb-2 leading-snug">
                {previewingBlog.title}
              </h3>

              <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {previewingBlog.summary}
              </p>

              {previewingBlog.highlights && previewingBlog.highlights.length > 0 && (
                <ul className="mb-4 space-y-1.5 border-l border-[var(--color-border)] pl-3">
                  {previewingBlog.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-muted)]">
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              {previewingBlog.tags && previewingBlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {previewingBlog.tags.map((t, i) => (
                    <span key={i} className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-xs font-mono text-[var(--color-text-muted)]">
                  {previewingBlog.stats?.likes && <span>❤️ {previewingBlog.stats.likes}</span>}
                  {previewingBlog.stats?.reposts && <span>🔁 {previewingBlog.stats.reposts}</span>}
                  {previewingBlog.stats?.views && <span>👁️ {previewingBlog.stats.views}</span>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const toEdit = previewingBlog;
                      setPreviewingBlog(null);
                      handleOpenBlogEditor(toEdit);
                    }}
                    className="px-3 py-1.5 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-white cursor-pointer"
                  >
                    Edit
                  </button>
                  <a
                    href={previewingBlog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded bg-[var(--color-amber)] text-black font-bold text-xs flex items-center gap-1 hover:brightness-110"
                  >
                    <span>View on X</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          FLOATING ACTION BUTTON
          ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            if (activeTab === "projects") {
              setCurrentProject(EMPTY_PROJECT);
              setIsEditingProject(true);
            } else {
              handleOpenBlogEditor();
            }
          }}
          className="px-5 py-3.5 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-amber-bright)] text-black font-bold text-xs tracking-wider uppercase shadow-[0_0_24px_rgba(255,94,58,0.5)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          <span>{activeTab === "projects" ? "CREATE PROJECT" : "WRITE DISPATCH"}</span>
        </button>
      </div>
    </div>
  );
}
