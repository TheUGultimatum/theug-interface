---
name: theUG Portfolio Design System
description: Industrial cyberpunk developer workspace & Web3 celestial observatory
colors:
  primary: "#FF5E3A"
  primary-bright: "#FF7B00"
  secondary: "#00D9FF"
  accent-cyan: "#00D9FF"
  accent-amber: "#FF5E3A"
  accent-amber-bright: "#FF7B00"
  void-bg: "#000000"
  abyss-bg: "#050505"
  surface-card: "#0A0A0A"
  elevated-card: "#111111"
  border-subtle: "#1A1A1A"
  border-bright: "#2A2A2A"
  text-primary: "#EDEDED"
  text-secondary: "#B0B0B0"
  text-muted: "#7C7C82"
  text-ghost: "#444444"
  meme-doge: "#FBBF24"
  meme-pepe: "#22C55E"
  meme-shib: "#F97316"
  meme-pengu: "#38BDF8"
typography:
  display:
    fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif"
    fontWeight: 700
  mono:
    fontFamily: "var(--font-mono), IBM Plex Mono, monospace"
    fontWeight: 500
  emailFallback:
    fontFamily: "Courier New, monospace"
    fontWeight: 400
  bebas:
    fontFamily: "var(--font-bebas), Bebas Neue, sans-serif"
    fontWeight: 400
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
---

# Design System

## Overview
theUG Portfolio embodies an industrial cyberpunk developer terminal and Web3 celestial observatory. The visual tone is technical, authentic, and cinematic: deep black voids and obsidian surfaces paired with bright kinetic amber lasers and telemetry cyan lights.

## Colors
- **Void Background (`#000000` / `#050505`)**: True black cosmic space foundation.
- **Industrial Amber Primary (`#FF5E3A` / `#FF7B00`)**: Core energy, commands, primary action buttons, solar flare glow.
- **Electric Cyan (`#00D9FF`)**: Active telemetry streams, system online beacons, consensus indicators, orbital coordinates.
- **Surface Elevation (`#0A0A0A` / `#111111`)**: Frosted carbon panels with hairline mechanical borders.
- **Day Mode (Obsidian Editorial)**: Warm slate editorial wash (`#F9F9FB` void, `#FFFFFF` surface, `#1A1A1E` charcoal text, `#D84315` cinnabar amber accents).

## Typography
- **Headings & Display**: Space Grotesk (`--font-space-grotesk`) and Bebas Neue (`--font-bebas`) for authoritative technical presence.
- **Data & Telemetry**: IBM Plex Mono (`--font-mono`) for console outputs, orbital coordinates, and metric specs.
- **Body Prose**: Clean sans-serif with comfortable line height (`1.6` - `2.0`), high contrast, and generous letter spacing.

## Layout
- Full-bleed interactive canvas experiences with docked, moveable holographic telemetry HUDs.
- Fluid responsive grid that gracefully adapts from multi-column desktop setups to single-column mobile corridors with dedicated top header clearance.

## Elevation & Depth
- Layered z-depth with soft offsets and atmospheric glowing halos.
- CRT-inspired scanline vignettes and fine radial coordinate guides.

## Shapes
- Crisp, mechanical border radii (`4px`, `8px` to `12px`) for panels.
- Circular planetary spheres and pill-shaped status tags (`9999px`).

## Components
- **Central Sun**: Upright, non-rotating Usmaan Gani creator core radiating deep space solar flares.
- **Orbital Worlds**: 11 glowing celestial bodies with authentic vector emblems and kinetic slingshot physics.
- **Meme Comets & Meteors**: Multi-depth celestial bodies (Pengu, Pepe, Doge, Shiba, Bonk) sweeping across 3D cosmic starfields.
- **Telemetry HUD**: Glassmorphic moveable card displaying live technical breakdown and ecosystem conviction.

## Do's and Don'ts
- **Do**: Maintain high-contrast semantic color pairings (text $\ge 4.5:1$ WCAG AA).
- **Do**: Maintain responsive touch targets ($\ge 44\text{px}$) on mobile viewports.
- **Don't**: Introduce heavy 3D frameworks (Three.js) when native high-DPI 2D Canvas delivers pure 120 FPS.
- **Don't**: Crowd viewports with redundant cards or unformatted text blocks.
