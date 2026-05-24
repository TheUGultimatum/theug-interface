import { cn } from "@/lib/utils";

interface TechTagProps {
  label: string;
  className?: string;
}

export function TechTag({ label, className }: TechTagProps) {
  return <span className={cn("tech-tag", className)}>{label}</span>;
}

interface TechTagGroupProps {
  tags: string[];
  className?: string;
}

export function TechTagGroup({ tags, className }: TechTagGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <TechTag key={tag} label={tag} />
      ))}
    </div>
  );
}
