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
  Search,
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

function ArticleSplitPreview({
  blog,
  highlights,
}: {
  blog: XPost;
  highlights: string[];
}) {
  const paragraphs = blog.body ? blog.body.split("\n\n").filter(Boolean) : [];
  return (
    <div className="p-6 md:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] h-[520px] overflow-y-auto space-y-5 shadow-inner">
      <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)] pb-3 border-b border-[var(--color-border)]">
        <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold text-[var(--color-amber)] bg-[rgba(255,94,58,0.08)] border border-[var(--color-border)]">
          {blog.category || "Web3"}
        </span>
        <span className="flex items-center gap-2">
          <span>{blog.publishedAt || "Live Draft"}</span>
          <span>•</span>
          <span>{blog.readTime || "4 min read"}</span>
        </span>
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] leading-snug">
        {blog.title || "Article Title Will Appear Here"}
      </h3>

      {blog.summary && (
        <div className="p-4 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)] text-xs md:text-sm text-[var(--color-text-secondary)] italic leading-relaxed">
          &ldquo;{blog.summary}&rdquo;
        </div>
      )}

      {highlights.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)] text-xs">
          <span className="font-bold text-[var(--color-amber)] flex items-center gap-1.5 mb-2 font-mono text-[11px] uppercase tracking-wider">
            <Sparkles size={12} />
            <span>Key Takeaways</span>
          </span>
          <ul className="space-y-1.5">
            {highlights.map((h, i) => (
              <li key={i} className="text-[var(--color-text-secondary)] flex items-start gap-2 leading-relaxed">
                <span className="text-[var(--color-cyan)] font-mono">›</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4 text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed font-sans">
        {paragraphs.length === 0 ? (
          <p className="text-[var(--color-text-muted)] italic font-mono text-xs">
            Start typing in the markdown editor to see synchronized live formatting...
          </p>
        ) : (
          paragraphs.map((p, idx) => {
            if (p.startsWith("## ")) {
              return (
                <h4 key={idx} className="text-base md:text-lg font-bold text-[var(--color-text-primary)] mt-5 pt-2 border-t border-[var(--color-border)]">
                  {p.replace("## ", "")}
                </h4>
              );
            }
            if (p.startsWith("### ")) {
              return (
                <h5 key={idx} className="text-sm md:text-base font-bold text-[var(--color-text-primary)] mt-4">
                  {p.replace("### ", "")}
                </h5>
              );
            }
            if (p.startsWith("> ")) {
              return (
                <blockquote key={idx} className="border-l-2 border-[var(--color-cyan)] pl-4 py-1 italic text-[var(--color-text-muted)] my-2">
                  {p.replace("> ", "")}
                </blockquote>
              );
            }
            return <p key={idx}>{p}</p>;
          })
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Active Management Tab: "projects" or "blogs"
  const [activeTab, setActiveTab] = useState<"projects" | "blogs">("projects");

  // Credentials
  const [username, setUsername] = useState<string>("");
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

  // Keyboard shortcuts (Escape to dismiss, Cmd/Ctrl+S to save)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewingBlog) setPreviewingBlog(null);
        else if (isEditingBlog) setIsEditingBlog(false);
        else if (isEditingProject) setIsEditingProject(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        if (isEditingBlog) {
          e.preventDefault();
          handleSaveBlog();
        } else if (isEditingProject) {
          e.preventDefault();
          handleSaveProject();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewingBlog, isEditingBlog, isEditingProject, currentBlog, currentProject, highlightsInput, tagsInput]);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("article-markdown-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = currentBlog.body || "";
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || "heading"}${suffix}`;
    const newBody = text.substring(0, start) + replacement + text.substring(end);
    setCurrentBlog((prev) => ({ ...prev, body: newBody }));
    setTimeout(() => {
      textarea.focus();
      const cursorTarget = start + prefix.length + (selected ? selected.length : 7);
      textarea.setSelectionRange(cursorTarget, cursorTarget);
    }, 15);
  };

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
                placeholder="Username"
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
                placeholder="••••••"
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
    <div className="min-h-screen px-6 md:px-12 py-10 max-w-[1440px] mx-auto pb-32">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 text-xs md:text-sm font-mono transition-all ${
            statusMessage.type === "success"
              ? "bg-[var(--color-surface)] border-[var(--color-online)] text-[var(--color-text-primary)]"
              : "bg-[var(--color-surface)] border-[var(--color-error)] text-[var(--color-error)]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-[var(--color-online)]" />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-8 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-online)] shadow-sm animate-pulse" />
            <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
              TheUG Console · Verified Admin
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] mt-2">
            Site Control Hub
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-xl leading-relaxed">
            Manage your live Web3 projects, essays, and X thread dispatches with instant sync.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs md:text-sm">
          <Link
            href={activeTab === "projects" ? "/projects" : "/blogs"}
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)] flex items-center gap-2 transition-all shadow-sm"
          >
            <Eye size={15} />
            <span>Live {activeTab.toUpperCase()}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:border-[var(--color-error)] transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Refined Navigation & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] mb-8 shadow-sm">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--color-elevated)]">
          <button
            onClick={() => {
              setActiveTab("projects");
              setActiveFilter("ALL");
              setSearchQuery("");
            }}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-[var(--color-amber)] text-black font-semibold shadow-md"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <FolderOpen size={16} />
            <span>PROJECTS ({projects.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("blogs");
              setActiveFilter("ALL");
              setSearchQuery("");
            }}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wider flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "blogs"
                ? "bg-[var(--color-amber)] text-black font-semibold shadow-md"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <BookOpen size={16} />
            <span>ARTICLES & DISPATCHES ({blogs.length})</span>
          </button>
        </div>

        {/* Action Trigger */}
        <div className="px-1 pb-1 sm:p-0">
          {activeTab === "projects" ? (
            <button
              onClick={() => {
                setCurrentProject(EMPTY_PROJECT);
                setIsEditingProject(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer font-mono shadow-sm"
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenBlogEditor()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer font-mono shadow-sm"
            >
              <Plus size={16} />
              <span>Write Article / Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────
          TAB 1: PROJECTS INVENTORY
          ───────────────────────────────────────────────────── */}
      {activeTab === "projects" && (
        <div>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border)] font-mono text-xs md:text-sm">
            <div className="flex flex-wrap gap-2">
              {["ALL", "LIVE", "FEATURED", "PRIVATE"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                    activeFilter === filter
                      ? "bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold shadow-sm"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative min-w-[280px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] shadow-inner transition-colors"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]">
                <p className="text-base text-[var(--color-text-secondary)] font-medium">No projects found.</p>
                <button
                  onClick={() => {
                    setCurrentProject(EMPTY_PROJECT);
                    setIsEditingProject(true);
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[var(--color-amber)] text-black font-bold text-xs md:text-sm inline-flex items-center gap-2 shadow-sm"
                >
                  <Plus size={16} />
                  <span>Create First Project</span>
                </button>
              </div>
            ) : (
              filteredProjects.map((project, idx) => (
                <div
                  key={project.id || idx}
                  className="p-6 md:p-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-[var(--color-border-bright)] shadow-sm hover:shadow-md"
                >
                  {project.bannerUrl && (
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-[var(--color-border)] shrink-0 bg-black hidden sm:block shadow-sm">
                      <Image
                        src={project.bannerUrl}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2 text-xs font-mono">
                      <span className="text-[var(--color-text-muted)] font-semibold">
                        {project.category}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[var(--color-online)] font-bold">
                        {project.status}
                      </span>
                      {project.featured && (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[rgba(255,94,58,0.1)] text-[var(--color-amber)] font-bold">
                          ★ Featured
                        </span>
                      )}
                      {project.isPrivate && (
                        <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                          <Lock size={11} />
                          Private
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-2.5">
                      <h3 className="font-bold text-lg md:text-xl text-[var(--color-text-primary)]">
                        {project.name}
                      </h3>
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">{project.year}</span>
                    </div>

                    <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 line-clamp-1 leading-relaxed">
                      {project.tagline || project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3 font-mono text-xs">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--color-border)] font-mono text-xs">
                    <div className="inline-flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden shadow-sm">
                      <button
                        onClick={() => handleReorderProject(idx, "up")}
                        disabled={idx === 0}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] disabled:opacity-20 cursor-pointer border-b border-[var(--color-border)] transition-colors"
                        title="Move up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        onClick={() => handleReorderProject(idx, "down")}
                        disabled={idx === projects.length - 1}
                        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] disabled:opacity-20 cursor-pointer transition-colors"
                        title="Move down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 w-9 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] hover:border-[var(--color-border-bright)] transition-all flex items-center justify-center shadow-sm"
                        title="Open live app"
                      >
                        <ExternalLink size={15} />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setCurrentProject(project);
                        setIsEditingProject(true);
                      }}
                      className="h-9 px-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="h-9 w-9 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[rgba(255,51,51,0.06)] transition-all cursor-pointer flex items-center justify-center shadow-sm"
                      title="Delete project"
                    >
                      <Trash2 size={15} />
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
        <div>
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-border)] font-mono text-xs md:text-sm">
            <div className="flex flex-wrap gap-2">
              {["ALL", "ARTICLES", "X_POSTS", ...BLOG_CATEGORIES].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm transition-all cursor-pointer ${
                    activeFilter === category
                      ? "bg-[var(--color-text-primary)] text-[var(--color-void)] font-bold shadow-sm"
                      : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative min-w-[280px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles or tags..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] shadow-inner transition-colors"
              />
            </div>
          </div>

          {/* Blogs List */}
          <div className="space-y-4">
            {filteredBlogs.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]">
                <BookOpen size={36} className="mx-auto text-[var(--color-text-muted)] mb-4 opacity-40" />
                <p className="text-base font-bold text-[var(--color-text-primary)]">No articles or dispatches published yet</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-md mx-auto leading-relaxed">
                  Post a normal long-form article directly on the website or embed a live thread from X.
                </p>
                <button
                  onClick={() => handleOpenBlogEditor()}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-[var(--color-amber)] text-black font-bold text-xs md:text-sm inline-flex items-center gap-2 cursor-pointer font-mono shadow-sm"
                >
                  <Plus size={16} />
                  <span>Write First Dispatch</span>
                </button>
              </div>
            ) : (
              filteredBlogs.map((blog, idx) => {
                const isArticle = blog.type === "article" || Boolean(blog.body);
                return (
                  <div
                    key={blog.id || idx}
                    className="p-6 md:p-7 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-[var(--color-border-bright)] shadow-sm hover:shadow-md"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2 text-xs font-mono">
                        <span className="px-2.5 py-1 rounded-md text-[11px] uppercase font-bold border border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-text-secondary)]">
                          {blog.category}
                        </span>
                        {isArticle ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-cyan)] font-semibold">
                            <FileText size={13} />
                            Article
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                            <XIcon size={12} />
                            X Post
                          </span>
                        )}
                        {blog.isPinned && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[rgba(255,94,58,0.1)] text-[var(--color-amber)]">
                            ★ Pinned
                          </span>
                        )}
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {blog.publishedAt} · {blog.readTime}
                        </span>
                      </div>

                      <h3 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] leading-snug">
                        {blog.title}
                      </h3>

                      <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                        {blog.summary}
                      </p>

                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 font-mono text-xs">
                          {blog.tags.map((tag) => (
                            <span key={tag} className="px-2.5 py-1 rounded-md bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--color-border)] font-mono text-xs">
                      <div className="inline-flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden shadow-sm">
                        <button
                          onClick={() => handleReorderBlog(idx, "up")}
                          disabled={idx === 0}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] disabled:opacity-20 cursor-pointer border-b border-[var(--color-border)] transition-colors"
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          onClick={() => handleReorderBlog(idx, "down")}
                          disabled={idx === blogs.length - 1}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] disabled:opacity-20 cursor-pointer transition-colors"
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>

                      <button
                        onClick={() => setPreviewingBlog(blog)}
                        className="h-9 px-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        title="Instant preview"
                      >
                        <Eye size={14} />
                        <span>Preview</span>
                      </button>

                      {isArticle && (
                        <Link
                          href={`/blogs/${blog.slug || blog.id}`}
                          target="_blank"
                          className="h-9 w-9 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-elevated)] hover:border-[var(--color-border-bright)] transition-all flex items-center justify-center shadow-sm"
                          title="Open reader page"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}

                      <button
                        onClick={() => handleOpenBlogEditor(blog)}
                        className="h-9 px-3.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBlog(blog.id, blog.title)}
                        className="h-9 w-9 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-error)] hover:text-[var(--color-error)] hover:bg-[rgba(255,51,51,0.06)] transition-all cursor-pointer flex items-center justify-center shadow-sm"
                        title="Delete dispatch"
                      >
                        <Trash2 size={15} />
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full my-8 p-8 md:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-h-[94vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  {currentProject.id ? `Edit Project: ${currentProject.name}` : "Create New Project"}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Configure project showcase card, technical stack, and repository telemetry.
                </p>
              </div>
              <button
                onClick={() => setIsEditingProject(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-bright)] cursor-pointer transition-colors"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={currentProject.name}
                    onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                    placeholder="e.g. THEUG HUB"
                    className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={currentProject.tagline}
                    onChange={(e) => setCurrentProject({ ...currentProject, tagline: e.target.value })}
                    placeholder="e.g. Decentralized identity & community hub"
                    className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                    Category
                  </label>
                  <select
                    value={currentProject.category}
                    onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-sm"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                      Status
                    </label>
                    <select
                      value={currentProject.status}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, status: e.target.value as ProjectStatus })
                      }
                      className="w-full px-3.5 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-sm"
                    >
                      <option value="live">Live (Active)</option>
                      <option value="wip">In Progress</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                      Year
                    </label>
                    <input
                      type="text"
                      value={currentProject.year}
                      onChange={(e) => setCurrentProject({ ...currentProject, year: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                    Live URL
                  </label>
                  <input
                    type="url"
                    value={currentProject.liveUrl || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={currentProject.githubUrl || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/TheUGultimatum/..."
                    className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
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
                    className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all border-[var(--color-border)] hover:border-[var(--color-amber)] bg-[var(--color-elevated)]"
                  >
                    {isUploadingImage ? (
                      <div className="flex items-center justify-center gap-2 py-3">
                        <RefreshCw size={16} className="animate-spin text-[var(--color-amber)]" />
                        <span>Uploading image...</span>
                      </div>
                    ) : currentProject.bannerUrl ? (
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-[var(--color-border)] shrink-0 bg-black shadow-sm">
                          <Image
                            src={currentProject.bannerUrl}
                            alt="Banner Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="text-xs font-bold text-[var(--color-online)]">✓ Image Attached</div>
                          <div className="text-[11px] text-[var(--color-text-muted)] truncate">Click to replace</div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 flex flex-col items-center gap-1.5 text-[var(--color-text-muted)]">
                        <Upload size={18} />
                        <span className="text-xs">Click to upload banner image</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
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
                      className="flex-1 px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
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
                      className="px-4 py-2.5 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)] hover:border-[var(--color-border-bright)] text-xs text-[var(--color-text-primary)] cursor-pointer font-semibold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {currentProject.stack.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-[11px] bg-[var(--color-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] flex items-center gap-1.5"
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
                          className="hover:text-[var(--color-error)] ml-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={currentProject.description}
                    onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                    placeholder="Short architectural overview..."
                    className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.featured}
                      onChange={(e) => setCurrentProject({ ...currentProject, featured: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs font-semibold">★ Featured / Spotlight</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.isPrivate}
                      onChange={(e) => setCurrentProject({ ...currentProject, isPrivate: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs font-semibold">Private Repo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditingProject(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-xs md:text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                className="px-7 py-2.5 rounded-xl bg-[var(--color-amber)] text-black font-bold text-xs md:text-sm tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md hover:scale-[1.01]"
              >
                <Save size={15} />
                <span>Save Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          BLOG / ARTICLE CREATOR MODAL WITH SPLIT-VIEW OVERDRIVE
          ───────────────────────────────────────────────────── */}
      {isEditingBlog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl w-full my-6 p-8 md:p-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl max-h-[94vh] overflow-y-auto font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
                  {currentBlog.id ? `Edit: ${currentBlog.title}` : "Write New Dispatch or Long-Form Article"}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Publish a native long-form markdown essay directly on the site, or embed a live thread from X.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Type Switcher: Article vs X Post */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setCurrentBlog({ ...currentBlog, type: "article" })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      currentBlog.type === "article" || (!currentBlog.type && currentBlog.body)
                        ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-bold border border-[var(--color-border)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <FileText size={13} />
                    <span>Full Article</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentBlog({ ...currentBlog, type: "x-post" })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      currentBlog.type === "x-post" && !currentBlog.body
                        ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm font-bold border border-[var(--color-border)]"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    <XIcon size={12} />
                    <span>X Post / Thread</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsEditingBlog(false)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Common Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              <div className="md:col-span-2">
                <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={currentBlog.title}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                  placeholder="e.g. Architectural Breakdown of On-Chain Convictions"
                  className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                />
              </div>

              <div>
                <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
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
                  className="w-full px-3.5 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL Row with Auto-Fill */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-[var(--color-text-secondary)] font-semibold">
                    Link to X Thread / Post {currentBlog.type === "x-post" ? "*" : "(Optional)"}
                  </label>
                  <span className="text-[11px] text-[var(--color-amber)]">
                    Auto-fill from X status URL
                  </span>
                </div>
                <div className="flex gap-2.5">
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
                    className="flex-1 px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAutoFetchLink()}
                    disabled={isFetchingPreview}
                    className="px-4 py-2.5 rounded-xl bg-[rgba(255,94,58,0.12)] border border-[var(--color-amber)] text-[var(--color-amber)] hover:bg-[var(--color-amber)] hover:text-black font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 shadow-sm"
                    title="Fetch title, summary, hashtags, and content from the link"
                  >
                    {isFetchingPreview ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>⚡ Auto-Fill</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                  Read Time / Format
                </label>
                <input
                  type="text"
                  value={currentBlog.readTime}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, readTime: e.target.value })}
                  placeholder="e.g. 5 min read"
                  className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                />
              </div>
            </div>

            {/* Summary, Highlights & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                  Executive Summary / Excerpt (Lead sentence)
                </label>
                <textarea
                  rows={3}
                  value={currentBlog.summary}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, summary: e.target.value })}
                  placeholder="Brief hook or thesis statement summarizing the article..."
                  className="w-full px-4 py-2.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-[var(--color-text-secondary)] font-semibold mb-1.5">
                    Core Highlights / Takeaways (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={highlightsInput}
                    onChange={(e) => setHighlightsInput(e.target.value)}
                    placeholder="Takeaway 1&#10;Takeaway 2&#10;Takeaway 3"
                    className="w-full px-4 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Tags: #Web3, #Base, #Solidity"
                      className="w-full px-3.5 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold shrink-0">
                    <input
                      type="checkbox"
                      checked={Boolean(currentBlog.isPinned)}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, isPinned: e.target.checked })}
                      className="accent-[var(--color-amber)]"
                    />
                    <span>★ Pin to Top</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SPLIT-VIEW OVERDRIVE: For Articles, Markdown Editor on Left, Live Preview on Right */}
            {currentBlog.type === "article" || currentBlog.body !== undefined ? (
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Markdown Source Editor */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2 font-mono text-xs text-[var(--color-text-muted)]">
                      <span className="font-bold text-[var(--color-cyan)] flex items-center gap-1.5">
                        <FileText size={14} />
                        <span>Markdown Source</span>
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--color-elevated)] border border-[var(--color-border)]">
                        {(currentBlog.body || "").length.toLocaleString()} chars ·{" "}
                        {Math.max(1, Math.round(((currentBlog.body || "").split(/\s+/).filter(Boolean).length) / 200))} min read
                      </span>
                    </div>

                    {/* Quick Markdown Format Toolbar */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)] mb-3 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => insertMarkdown("## ", "\n\n")}
                        className="px-2.5 py-1 rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                        title="Insert Heading 2"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("### ", "\n\n")}
                        className="px-2.5 py-1 rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                        title="Insert Subheading 3"
                      >
                        H3
                      </button>
                      <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("> ", "\n\n")}
                        className="px-2.5 py-1 rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                        title="Insert Quote block"
                      >
                        &gt; Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("- ", "\n")}
                        className="px-2.5 py-1 rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                        title="Insert Bullet Item"
                      >
                        • List
                      </button>
                      <div className="w-[1px] h-4 bg-[var(--color-border)] mx-1" />
                      <button
                        type="button"
                        onClick={() => insertMarkdown("**", "**")}
                        className="px-2.5 py-1 rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[11px] font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                        title="Insert Bold text"
                      >
                        **B**
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown("`", "`")}
                        className="px-2.5 py-1 rounded-lg border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[11px] font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
                        title="Insert Inline Code"
                      >
                        `code`
                      </button>
                    </div>

                    <textarea
                      id="article-markdown-textarea"
                      rows={18}
                      value={currentBlog.body || ""}
                      onChange={(e) => setCurrentBlog({ ...currentBlog, body: e.target.value })}
                      placeholder="Write your complete essay or technical breakdown here directly...&#10;&#10;## High-Level Architecture&#10;Describe the core thesis and mechanics here...&#10;&#10;### Key Discoveries&#10;Explain in detail with code or design decisions...&#10;&#10;> Quote or key rule of thumb&#10;&#10;Conclusion and final verdict..."
                      className="w-full h-[520px] p-5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded-2xl text-xs md:text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)] font-mono leading-relaxed shadow-inner resize-none overflow-y-auto"
                    />
                    <div className="mt-2 text-[11px] text-[var(--color-text-muted)] flex items-center justify-between font-mono">
                      <span>Supports ## Heading, ### Subheading, &gt; Quote, bullets, and blank lines</span>
                    </div>
                  </div>

                  {/* Right Column: Live Synchronized Preview */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2 font-mono text-xs text-[var(--color-text-muted)]">
                      <span className="font-bold text-[var(--color-amber)] flex items-center gap-1.5">
                        <Eye size={14} />
                        <span>Synchronized Live Reader Preview</span>
                      </span>
                      <span className="text-[11px] text-[var(--color-online)] font-semibold">
                        ● Real-time
                      </span>
                    </div>

                    {/* Toolbar spacer to align perfectly with left column */}
                    <div className="h-[43px] mb-3 flex items-center px-3.5 rounded-xl bg-[var(--color-elevated)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] font-mono">
                      <span>WYSIWYG article display matched to public reader</span>
                    </div>

                    <ArticleSplitPreview
                      blog={currentBlog}
                      highlights={highlightsInput.split("\n").map((h) => h.trim()).filter(Boolean)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* For X Posts: Live Card Preview */
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-[var(--color-text-muted)]">
                  <span className="font-bold text-[var(--color-amber)] flex items-center gap-1.5">
                    <Eye size={14} />
                    <span>Live Dispatch Card Preview</span>
                  </span>
                  <span>Shown on /blogs and homepage</span>
                </div>

                <div className="max-w-xl mx-auto p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                        {currentBlog.category || "Web3"}
                      </span>
                      {currentBlog.isPinned && (
                        <span className="text-[10px] text-[var(--color-amber)] font-bold">
                          ★ Featured
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {currentBlog.publishedAt || "Nov 2026"} · {currentBlog.readTime || "3 min read"}
                    </span>
                  </div>

                  <h4 className="font-bold text-base md:text-lg text-[var(--color-text-primary)] mb-2 leading-snug">
                    {currentBlog.title || "Dispatch Title Will Appear Here"}
                  </h4>

                  <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                    {currentBlog.summary || "Summary preview will appear here..."}
                  </p>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between font-mono text-xs">
                    <span className="text-[var(--color-text-muted)]">@Usmaangani252</span>
                    <span className="text-[var(--color-amber)] font-semibold flex items-center gap-1">
                      <span>View on X</span>
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditingBlog(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-xs md:text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                className="px-8 py-3 rounded-xl bg-[var(--color-amber)] text-black font-bold text-xs md:text-sm tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg hover:scale-[1.01]"
              >
                <Save size={15} />
                <span>{currentBlog.id ? "Update Dispatch" : "Publish to Site"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          QUICK PREVIEW MODAL
          ───────────────────────────────────────────────────── */}
      {previewingBlog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-6">
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2">
                <Eye size={15} className="text-[var(--color-amber)]" />
                <span>Live Card Preview</span>
              </span>
              <button
                onClick={() => setPreviewingBlog(null)}
                className="text-xs px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <article className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] shadow-sm">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                  {previewingBlog.category}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {previewingBlog.publishedAt} · {previewingBlog.readTime}
                </span>
              </div>

              <h3 className="font-bold text-lg md:text-xl text-[var(--color-text-primary)] mb-2 leading-snug">
                {previewingBlog.title}
              </h3>

              <p className="text-xs md:text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                {previewingBlog.summary}
              </p>

              {previewingBlog.highlights && previewingBlog.highlights.length > 0 && (
                <ul className="mb-4 space-y-1.5 border-l-2 border-[var(--color-border-bright)] pl-3">
                  {previewingBlog.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      {h}
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <button
                  onClick={() => {
                    const toEdit = previewingBlog;
                    setPreviewingBlog(null);
                    handleOpenBlogEditor(toEdit);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-amber)]"
                >
                  Edit
                </button>

                {previewingBlog.type === "article" || previewingBlog.body ? (
                  <Link
                    href={`/blogs/${previewingBlog.slug || previewingBlog.id}`}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-[var(--color-amber)] text-black font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight size={13} />
                  </Link>
                ) : (
                  <a
                    href={previewingBlog.url || "https://x.com/Usmaangani252"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[var(--color-amber)] text-black font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>View on X</span>
                    <ArrowUpRight size={13} />
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
