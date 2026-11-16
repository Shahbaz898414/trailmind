import { Suspense, type ReactNode } from "react";

import { sampleTripsList } from "@/data/trips";

/**
 * Server-component layout for the dynamic `[id]` trip segment.
 *
 * The pages beneath it are client components (they read `params` with
 * `use()`), and a `"use client"` file cannot export `generateStaticParams`.
 * Declaring it here — on the server side of the segment — lets `next build`
 * (with `cacheComponents`) prerender every known trip id, so `params` and the
 * sidebar's `usePathname()` resolve at build time instead of suspending.
 */
export function generateStaticParams() {
  return sampleTripsList.map((trip) => ({ id: trip.id }));
}

export default function TripSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The pages below are client components that read `params` with `use()`.
  // For ids outside `generateStaticParams` the promise stays pending during
  // prerendering, so the read must sit behind a Suspense boundary — otherwise
  // React has nowhere to put the fallback and the build fails.
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] w-full items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-xs font-medium text-on-surface-variant">
              Loading expedition…
            </p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
