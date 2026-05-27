"use client";

import dynamic from "next/dynamic";

export const LabsClient = dynamic(() => import("./Labs").then(m => m.Labs), { 
  ssr: false 
});
