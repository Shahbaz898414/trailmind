import Link from "next/link";
import { ArrowRight, CalendarDays, HardDrive, MapPin, Mountain } from "lucide-react";
import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDateRange, formatCount } from "@/lib/format";
import type { CoverTheme, Trip } from "@/types/travel";

/** Cover gradients per theme — static class strings so Tailwind can see them. */
const coverStyles: Record<CoverTheme, string> = {
  forest: "from-brand-forest via-brand-forest/85 to-brand-sage/70",
  sage: "from-brand-sage via-brand-sage/85 to-brand-accent/60",
  accent: "from-brand-accent via-brand-accent/85 to-brand-forest/80",
  dusk: "from-brand-forest via-brand-accent/80 to-brand-sage",
};

const statusLabels: Record<Trip["status"], string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  "in-progress": "In progress",
  completed: "Completed",
};

const statusVariant: Record<
  Trip["status"],
  "secondary" | "outline" | "default" | "ghost"
> = {
  draft: "outline",
  upcoming: "secondary",
  "in-progress": "default",
  completed: "ghost",
};

/**
 * Trip preview card for the dashboard and `/trips`.
 *
 * Data comes from `src/constants/sample-data.ts` for now — swap the `trip`
 * prop for a Dexie/Firestore record once persistence is wired up.
 */
export function TravelCard({ trip }: { trip: Trip }) {
  const budgetPercent = Math.min(
    100,
    Math.round((trip.budget.spent / trip.budget.total) * 100)
  );

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      {/* Decorative cover — replaced by real photos later */}
      <div
        className={cn(
          "relative flex h-28 items-end justify-between overflow-hidden bg-gradient-to-br px-4 pb-3 pt-4",
          coverStyles[trip.cover]
        )}
      >
        <Mountain
          className="absolute -right-3 -top-4 size-20 text-white/15"
          aria-hidden
        />
        <span className="relative rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium text-white">
          {trip.countryCode}
        </span>
        <Badge
          variant={statusVariant[trip.status]}
          className="relative bg-white/90 text-foreground"
        >
          {statusLabels[trip.status]}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="font-heading text-base leading-snug">
          {trip.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{trip.destination}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>

        <p className="line-clamp-2 text-sm text-foreground/80">
          {trip.summary}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {formatCurrency(trip.budget.spent, trip.budget.currency)} of{" "}
              {formatCurrency(trip.budget.total, trip.budget.currency)}
            </span>
            <span>{budgetPercent}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={budgetPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Budget used"
          >
            <div
              className="h-full rounded-full bg-brand-accent"
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <HardDrive className="size-3.5" aria-hidden />
          {trip.offlineReady ? "Offline ready" : "Not downloaded"}
        </span>
        <span>{formatCount(trip.placesCount)} places</span>
        <Link
          href="/trips"
          className="flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Open
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}
