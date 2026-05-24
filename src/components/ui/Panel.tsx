"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  showControls?: boolean;
  glowOnHover?: boolean;
}

export function Panel({
  title,
  badge,
  actions,
  className,
  bodyClassName,
  children,
  showControls = true,
  glowOnHover = true,
}: PanelProps) {
  return (
    <div className={cn("panel", glowOnHover && "animate-glow-pulse", className)}>
      {(title || showControls) && (
        <div className="panel-header">
          {showControls && (
            <div className="panel-controls">
              <span className="panel-dot panel-dot-red" />
              <span className="panel-dot panel-dot-yellow" />
              <span className="panel-dot panel-dot-green" />
            </div>
          )}
          {title && <span className="panel-title">{title}</span>}
          {badge && <div className="ml-auto">{badge}</div>}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("panel-body", bodyClassName)}>{children}</div>
    </div>
  );
}
