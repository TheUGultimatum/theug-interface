import { Background } from "./Background";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { CommandPalette } from "@/components/ui/CommandPalette";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

export function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="workspace-layout">
      {/* Global CRT scanline filter layer */}
      <div className="crt-overlay" />

      <CustomCursor />
      <CommandPalette />
      <Background />
      <Sidebar />
      <TopBar />
      <main
        className="workspace-content relative z-10 pt-[94px] md:pt-[52px] animate-fade-in"
      >
        {children}
      </main>
    </div>
  );
}
