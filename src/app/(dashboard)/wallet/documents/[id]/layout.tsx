import { Suspense, type ReactNode } from "react";

import { travelDocumentsList } from "@/data/travel-documents";

/**
 * Server-component layout for the dynamic `[id]` travel-document segment.
 *
 * The page beneath it is a client component (it reads `params` with `use()`),
 * and a `"use client"` file cannot export `generateStaticParams`. Declaring it
 * here lets `next build` (with `cacheComponents`) prerender every known
 * document id, so `params` and the sidebar's `usePathname()` resolve at build
 * time instead of suspending.
 */
export function generateStaticParams() {
  return travelDocumentsList.map((doc) => ({ id: doc.id }));
}

export default function DocumentSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  // The page below is a client component that reads `params` with `use()`.
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
              Opening document…
            </p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
