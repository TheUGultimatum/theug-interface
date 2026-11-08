export type ProjectStatus = "live" | "wip" | "lab" | "archived";

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  deployTarget?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  accentColor: string;
  accentRgb: string;
  category: string;
  year: string;
  isPrivate?: boolean;
  bannerUrl?: string;
  metrics?: ProjectMetric[];
}

