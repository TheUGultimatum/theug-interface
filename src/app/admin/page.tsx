"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Project, ProjectStatus } from "@/types/project";
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
  Image as ImageIcon,
  X,
  KeyRound,
  UserCheck
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Multi-factor credentials state
  const [username, setUsername] = useState<string>("theug");
  const [password, setPassword] = useState<string>("");
  const [pin, setPin] = useState<string>("");

  const [projects, setProjects] = useState<Project[]>(defaultProjects as Project[]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProject, setCurrentProject] = useState<Project>(EMPTY_PROJECT);
  const [stackInput, setStackInput] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // Image upload state
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

  const notify = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Image Upload handler
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
    } catch (err) {
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
        setIsEditing(false);
        setCurrentProject(EMPTY_PROJECT);
        notify(`Project "${projectToSave.name}" published to live inventory!`);
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

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newProjects = [...projects];
    const [moved] = newProjects.splice(index, 1);
    newProjects.splice(targetIndex, 0, moved);
    setProjects(newProjects);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ projects: newProjects }),
      });
      const data = await res.json();
      if (data.success) {
        notify("Order updated");
      }
    } catch {
      notify("Failed to persist order", "error");
    }
  };

  const handleExportJson = () => {
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

  const handleAddStackTag = () => {
    if (!stackInput.trim()) return;
    const clean = stackInput.trim();
    if (!currentProject.stack.includes(clean)) {
      setCurrentProject((prev) => ({ ...prev, stack: [...prev.stack, clean] }));
    }
    setStackInput("");
  };

  const handleRemoveStackTag = (tag: string) => {
    setCurrentProject((prev) => ({
      ...prev,
      stack: prev.stack.filter((s) => s !== tag),
    }));
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.stack.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "FEATURED" && p.featured) ||
      (activeFilter === "LIVE" && p.status === "live") ||
      (activeFilter === "PRIVATE" && p.isPrivate);
    return matchesSearch && matchesFilter;
  });

  /* ─────────────────────────────────────────────────────────
     MULTI-FACTOR HIGH SECURITY LOGIN GATE
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
          {/* Header */}
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
            {/* Username */}
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

            {/* Password */}
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

            {/* Security PIN */}
            <div>
              <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <KeyRound size={12} className="text-[var(--color-purple)]" />
                  6-DIGIT HARDWARE / CLEARANCE PIN
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
              SYS.ADMIN // SECURE SESSION ACTIVE (24H CLEARANCE)
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] tracking-wider mt-1">
            PORTFOLIO COMMAND CONSOLE
          </h1>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Add new projects, upload banners, edit tech stacks, manage live demos & private repos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/projects"
            target="_blank"
            className="px-3.5 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-cyan)] text-[var(--color-text-secondary)] hover:text-[var(--color-cyan)] text-xs flex items-center gap-1.5 transition-all"
          >
            <Eye size={14} />
            <span>VIEW LIVE SITE</span>
          </Link>

          <button
            onClick={handleExportJson}
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
          PROMINENT HERO ACTION BANNER: CREATE NEW PROJECT
          ───────────────────────────────────────────────────── */}
      <div className="my-6 p-6 rounded-xl border-2 border-[var(--color-amber)] bg-gradient-to-r from-[rgba(255,94,58,0.12)] via-[rgba(255,94,58,0.04)] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_32px_rgba(255,94,58,0.15)] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[var(--color-amber)] text-[10px] tracking-widest font-bold">
            <Sparkles size={14} />
            <span>PROJECT INVENTORY ACTION</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-[var(--color-text-primary)] mt-1">
            Want to feature a new build, website, or decentralized node?
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xl">
            Click below to open the project creator. Upload custom images, configure GitHub links, set private badges, and publish directly to the live portfolio.
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentProject(EMPTY_PROJECT);
            setIsEditing(true);
          }}
          className="relative z-10 shrink-0 px-6 py-3.5 rounded-lg bg-[var(--color-amber)] text-black font-mono font-bold text-sm tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(255,94,58,0.4)]"
        >
          <Plus size={18} strokeWidth={3} />
          <span>+ CREATE NEW PROJECT</span>
        </button>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[rgba(255,94,58,0.15)] to-transparent pointer-events-none" />
      </div>

      {/* METRICS OVERVIEW STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-6">
        {[
          { label: "TOTAL INVENTORY", value: projects.length, color: "var(--color-cyan)" },
          { label: "LIVE DEPLOYMENTS", value: projects.filter((p) => p.status === "live").length, color: "var(--color-online)" },
          { label: "FEATURED SPOTLIGHTS", value: projects.filter((p) => p.featured).length, color: "var(--color-amber)" },
          { label: "PRIVATE REPOSITORIES", value: projects.filter((p) => p.isPrivate).length, color: "var(--color-purple)" },
          { label: "LAB EXPERIMENTS", value: projects.filter((p) => p.status === "wip" || p.status === "lab").length, color: "var(--color-warning)" },
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

      {/* ─────────────────────────────────────────────────────
          PROJECT CREATOR / EDITOR MODAL (WITH IMAGE UPLOADER)
          ───────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="panel max-w-4xl w-full my-6 p-6 md:p-8 relative max-h-[92vh] overflow-y-auto"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-bright)",
              boxShadow: "0 16px 64px rgba(0,0,0,0.95), 0 0 32px rgba(0,212,255,0.1)",
            }}
          >
            {/* Modal Header */}
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
                onClick={() => setIsEditing(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm px-2 py-1 cursor-pointer"
              >
                ✕ CANCEL
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Left Column: Form Fields */}
              <div className="flex flex-col gap-4">
                {/* Name */}
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

                {/* Tagline */}
                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    TAGLINE (ONE-SENTENCE PUNCHLINE)
                  </label>
                  <input
                    type="text"
                    value={currentProject.tagline}
                    onChange={(e) => setCurrentProject({ ...currentProject, tagline: e.target.value })}
                    placeholder="e.g. Decentralized identity & community hub"
                    className="w-full px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                  />
                </div>

                {/* Description */}
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

                {/* Category & Status */}
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
                      <option value="lab">LAB [ ▲ EXPERIMENTAL ]</option>
                      <option value="archived">ARCHIVED [ ○ OFF ]</option>
                    </select>
                  </div>
                </div>

                {/* Target & Year */}
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

                {/* URLs */}
                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    LIVE URL (DEPLOYMENT LINK)
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

              {/* Right Column: Image Upload, Stack, Aesthetics & Live Preview */}
              <div className="flex flex-col gap-4">
                {/* ─────────────────────────────────────────────────
                    IMAGE UPLOADER ZONE
                    ───────────────────────────────────────────────── */}
                <div className="p-3.5 rounded bg-[var(--color-void)] border border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-text-primary)]">
                      <ImageIcon size={13} className="text-[var(--color-cyan)]" />
                      PROJECT BANNER IMAGE
                    </label>
                    {currentProject.bannerUrl && (
                      <button
                        type="button"
                        onClick={() => setCurrentProject({ ...currentProject, bannerUrl: "" })}
                        className="text-[9px] text-[var(--color-error)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <X size={10} /> REMOVE
                      </button>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  {/* Upload Dropzone Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                      currentProject.bannerUrl
                        ? "border-[var(--color-online)]/40 bg-[rgba(0,217,255,0.03)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-amber)] hover:bg-[rgba(255,94,58,0.02)]"
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-2">
                        <RefreshCw size={20} className="text-[var(--color-cyan)] animate-spin" />
                        <span className="text-[11px] text-[var(--color-cyan)]">UPLOADING IMAGE TO SERVER...</span>
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
                          <div className="text-[9px] text-[var(--color-text-muted)] truncate">
                            {currentProject.bannerUrl}
                          </div>
                          <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5 hover:underline">
                            Click to replace image
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                        <div className="p-2 rounded-full bg-white/5 text-[var(--color-text-muted)] group-hover:text-[var(--color-amber)]">
                          <Upload size={16} />
                        </div>
                        <span className="text-[11px] text-[var(--color-text-primary)] font-bold">
                          Click to upload project screenshot / banner
                        </span>
                        <span className="text-[9px] text-[var(--color-text-muted)]">
                          Supports PNG, JPG, WEBP, SVG, GIF (Max 10MB)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Manual URL fallback */}
                  <div className="mt-2.5">
                    <span className="text-[9px] text-[var(--color-text-muted)] block mb-1">
                      Or specify image path / external URL:
                    </span>
                    <input
                      type="text"
                      value={currentProject.bannerUrl || ""}
                      onChange={(e) => setCurrentProject({ ...currentProject, bannerUrl: e.target.value })}
                      placeholder="/images/dinorun.png or https://..."
                      className="w-full px-2.5 py-1.5 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-[10px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                    />
                  </div>
                </div>

                {/* Tech Stack Tags */}
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
                          handleAddStackTag();
                        }
                      }}
                      placeholder="e.g. Next.js, Rust, Docker (Press Enter)"
                      className="flex-1 px-3 py-2 bg-[var(--color-elevated)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-cyan)]"
                    />
                    <button
                      type="button"
                      onClick={handleAddStackTag}
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
                          onClick={() => handleRemoveStackTag(tag)}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div>
                  <label className="block text-[10px] text-[var(--color-text-secondary)] mb-1 font-bold">
                    ACCENT THEME PALETTE
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

                {/* Toggles: Featured & Private */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded bg-[var(--color-void)] border border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.featured || false}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, featured: e.target.checked })
                      }
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs text-[var(--color-text-primary)] font-bold">
                      ★ FEATURED BANNER
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={currentProject.isPrivate || false}
                      onChange={(e) =>
                        setCurrentProject({ ...currentProject, isPrivate: e.target.checked })
                      }
                      className="accent-[var(--color-amber)]"
                    />
                    <span className="text-xs text-[var(--color-text-primary)] flex items-center gap-1 font-bold">
                      <Lock size={12} className="text-[var(--color-amber)]" />
                      <span>PRIVATE REPO</span>
                    </span>
                  </label>
                </div>

                {/* LIVE CARD PREVIEW */}
                <div className="mt-1">
                  <span className="block text-[9px] text-[var(--color-text-muted)] tracking-wider mb-1.5 font-bold">
                    LIVE CARD PREVIEW:
                  </span>
                  <div
                    className="p-4 rounded border transition-all relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, rgba(${currentProject.accentRgb},0.06) 0%, var(--color-surface) 60%)`,
                      borderColor: `rgba(${currentProject.accentRgb}, 0.35)`,
                    }}
                  >
                    {/* Simulated image banner preview if present */}
                    {currentProject.bannerUrl && (
                      <div className="relative w-full h-24 mb-3 rounded overflow-hidden border border-white/10">
                        <Image
                          src={currentProject.bannerUrl}
                          alt="Banner"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="text-[var(--color-text-muted)]">{currentProject.category}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold"
                        style={{
                          color: `rgb(${currentProject.accentRgb})`,
                          border: `1px solid rgba(${currentProject.accentRgb},0.4)`,
                          background: `rgba(${currentProject.accentRgb},0.08)`,
                        }}
                      >
                        {currentProject.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                      {currentProject.name || "UNTITLED PROJECT"}
                    </h3>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">
                      {currentProject.tagline || currentProject.description || "Project summary preview..."}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {currentProject.stack.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 text-[9px] rounded bg-white/5 border border-white/10 text-[var(--color-text-muted)]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveProject}
                className="px-6 py-2.5 rounded bg-[var(--color-amber)] text-black font-bold text-xs flex items-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-[0_0_16px_rgba(255,94,58,0.35)]"
              >
                <Save size={15} />
                <span>SAVE & PUBLISH TO SITE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-4">
        {/* Search */}
        <div className="w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, stack, or target..."
            className="w-full px-3.5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-amber)]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "FEATURED", "LIVE", "PRIVATE"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded text-[10px] tracking-wider transition-all cursor-pointer ${
                activeFilter === filter
                  ? "bg-[var(--color-amber)] text-black font-bold shadow-[0_0_8px_rgba(255,94,58,0.3)]"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECTS INVENTORY LIST */}
      <div className="flex flex-col gap-3 my-4">
        {filteredProjects.length === 0 ? (
          <div className="panel p-12 text-center text-[var(--color-text-muted)] text-xs border border-[var(--color-border)]">
            <p>No projects matched the search criteria.</p>
            <button
              onClick={() => {
                setCurrentProject(EMPTY_PROJECT);
                setIsEditing(true);
              }}
              className="mt-3 px-4 py-2 rounded bg-[var(--color-amber)] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Create First Project</span>
            </button>
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
              {/* Thumbnail preview if bannerUrl exists */}
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

              {/* Project Info */}
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

                {/* Stack tags */}
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

              {/* Actions & Links */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--color-border)]">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5 mr-2">
                  <button
                    onClick={() => handleReorder(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => handleReorder(idx, "down")}
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
                    setIsEditing(true);
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

      {/* ─────────────────────────────────────────────────────
          FLOATING ACTION BUTTON (ALWAYS VISIBLE ON SCREEN)
          ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setCurrentProject(EMPTY_PROJECT);
            setIsEditing(true);
          }}
          className="px-5 py-3.5 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-amber-bright)] text-black font-bold text-xs tracking-wider uppercase shadow-[0_0_24px_rgba(255,94,58,0.5)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={18} strokeWidth={3} />
          <span>CREATE PROJECT</span>
        </button>
      </div>
    </div>
  );
}
