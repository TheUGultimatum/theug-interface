"use client";

import dynamic from "next/dynamic";

export const BlogsClient = dynamic(
  () => import("./Blogs").then((m) => m.Blogs),
  { ssr: false }
);

