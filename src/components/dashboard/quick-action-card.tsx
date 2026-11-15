import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type QuickActionCardProps = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

/** Link card that mirrors the sidebar sections. */
export function QuickActionCard({
  label,
  description,
  href,
  icon: Icon,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full gap-3 transition-colors group-hover:border-primary/40 group-hover:shadow-sm">
        <CardContent className="flex h-full flex-col gap-2 p-0">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-forest/10 text-brand-forest transition-colors group-hover:bg-brand-forest group-hover:text-primary-foreground">
            <Icon className="size-4" aria-hidden />
          </span>
          <span className="font-heading text-sm font-semibold text-foreground">
            {label}
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
          <span className="mt-auto flex items-center gap-1 pt-1 text-xs font-medium text-primary">
            Open
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
