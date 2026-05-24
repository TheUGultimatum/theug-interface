"use client";

import { HeroLeft } from "./HeroLeft";
import { HeroRight } from "./HeroRight";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-[calc(100vh-40px)] flex items-center"
      style={{ padding: "32px 28px 40px" }}
    >
      {/* Asymmetric 5+7 grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-center">
        {/* Left — Identity (5 cols) */}
        <div className="lg:col-span-5 animate-fade-in-up">
          <HeroLeft />
        </div>

        {/* Right — Dashboard (7 cols) */}
        <div className="lg:col-span-7 animate-fade-in-up delay-200">
          <HeroRight />
        </div>
      </div>
    </section>
  );
}
