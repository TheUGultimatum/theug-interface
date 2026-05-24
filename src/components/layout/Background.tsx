"use client";

export function Background() {
  return (
    <div className="bg-atmosphere" aria-hidden="true" suppressHydrationWarning>
      <div className="bg-grid" />
      <div className="bg-scanlines" />
      <div className="bg-vignette" />
    </div>
  );
}
