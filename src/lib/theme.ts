"use client";

export type Theme = "light" | "dark";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem("theug-theme") as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {}
  return "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const isLight = theme === "light";
  if (isLight) {
    document.documentElement.classList.add("day-mode");
  } else {
    document.documentElement.classList.remove("day-mode");
  }
  try {
    localStorage.setItem("theug-theme", theme);
  } catch {}
}

export function toggleTheme(): Theme {
  const current = getTheme();
  const next: Theme = current === "light" ? "dark" : "light";
  applyTheme(next);
  return next;
}

