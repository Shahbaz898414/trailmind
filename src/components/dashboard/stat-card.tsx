import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

import { Card, CardContent } from "@/components/ui/card";

type Accent = "forest" | "sage" | "accent";

const accentStyles: Record<Accent, string> = {
  forest: "bg-brand-forest/10 text-brand-forest",
  sage: "bg-brand-sage/35 text-brand-forest",
  accent: "bg-brand-accent/20 text-accent-foreground",
};

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  accent?: Accent;
};

/** Compact headline number used on the dashboard landing page. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "forest",
}: StatCardProps) {
  return (
    <Card size="sm" className="gap-2">
      <CardContent className="flex items-start justify-between gap-3 p-0">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            accentStyles[accent]
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </CardContent>
    </Card>
  );
}
