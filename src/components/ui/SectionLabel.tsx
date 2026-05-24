import { cn } from "@/lib/utils";

interface SectionLabelProps {
  label: string;
  className?: string;
}

export function SectionLabel({ label, className }: SectionLabelProps) {
  return (
    <div className={cn("section-label", className)}>
      <span style={{ color: "var(--color-amber)" }}>{label}</span>
    </div>
  );
}
