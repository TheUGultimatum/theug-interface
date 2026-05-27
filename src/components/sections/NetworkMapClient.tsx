"use client";

import dynamic from "next/dynamic";

export const NetworkMapClient = dynamic(() => import("./NetworkMap").then(m => m.NetworkMap), { 
  ssr: false 
});
