import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CircleCheck,
  HardDrive,
  Map as MapIcon,
  Sparkles,
} from "lucide-react";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { TravelCard } from "@/components/dashboard/travel-card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardNav } from "@/constants/navigation";
import { sampleStats, sampleTrips } from "@/constants/sample-data";
import { formatCount } from "@/lib/format";

/** Dashboard landing page — preview data only, clearly labelled below. */
export default function DashboardPage() {
  const upcomingTrips = sampleTrips.filter((trip) => trip.status !== "completed");
  const previewTrips = upcomingTrips.slice(0, 3);

  return (
    <PageContainer>
      <PageHeader
        title="Good to see you"
        description="Here is what is happening across your trips — and what is ready when you lose signal."
        actions={
          <>
            <Link href="/trips" className={buttonVariants({ variant: "outline" })}>
              <MapIcon aria-hidden />
              All trips
            </Link>
            <Link href="/trips" className={buttonVariants()}>
              Plan a trip
              <ArrowRight aria-hidden />
            </Link>
          </>
        }
      />

      {/* Headline numbers */}
      <section aria-label="Trip statistics" className="mb-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            label="Trips planned"
            value={formatCount(sampleStats.tripsPlanned)}
            hint={`${formatCount(sampleStats.tripsCompleted)} completed`}
            icon={MapIcon}
            accent="forest"
          />
          <StatCard
            label="Places saved"
            value={formatCount(sampleStats.placesSaved)}
            hint="Across every trip"
            icon={Bookmark}
            accent="sage"
          />
          <StatCard
            label="Offline packs"
            value={formatCount(sampleStats.offlinePacks)}
            hint="Ready with no signal"
            icon={HardDrive}
            accent="accent"
          />
          <StatCard
            label="Assistant"
            value="Hybrid"
            hint="On-device + cloud"
            icon={Sparkles}
            accent="forest"
          />
        </div>
      </section>

      {/* Trips */}
      <section aria-labelledby="trips-heading" className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            id="trips-heading"
            className="font-heading text-lg font-semibold text-foreground"
          >
            Your upcoming trips
          </h2>
          <Link
            href="/trips"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {previewTrips.map((trip) => (
            <TravelCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      {/* Quick actions — every planned section in one place */}
      <section aria-labelledby="sections-heading" className="mb-8">
        <h2
          id="sections-heading"
          className="mb-3 font-heading text-lg font-semibold text-foreground"
        >
          Jump to a section
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {dashboardNav.map((item) => (
            <QuickActionCard
              key={item.href}
              label={item.label}
              description={item.description}
              href={item.href}
              icon={item.icon}
            />
          ))}
        </div>
      </section>

      {/* Honest status of the build */}
      <section
        aria-label="Project status"
        className="rounded-xl border border-border bg-card p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-sage/40 text-brand-forest">
            <CircleCheck className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
              Preview build
              <Badge variant="secondary">Sample data</Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              The trips, places and budget numbers above come from{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                src/constants/sample-data.ts
              </code>{" "}
              so the UI can be reviewed before storage is wired up. Firebase
              Auth, Firestore sync and hybrid AI are scaffolded but not yet
              verified — nothing here is simulated.
            </p>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
