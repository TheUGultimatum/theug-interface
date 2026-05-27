"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setIsLocked(true);
    const timer = setTimeout(() => setIsLocked(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`w-full h-full ${isLocked ? "pointer-events-none" : "pointer-events-auto"}`}
    >
      {children}
    </motion.div>
  );
}
