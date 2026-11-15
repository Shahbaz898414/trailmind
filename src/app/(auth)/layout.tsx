import type { ReactNode } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";

import { siteConfig } from "@/constants/site";

/**
 * Route group `(auth)` — centred, chrome-free layout for login, signup and
 * onboarding. Route groups don't change the URL, so these pages stay at
 * `/login`, `/signup` and `/onboarding`.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-accent text-brand-forest">
            <Compass className="size-5" aria-hidden />
          </span>
          <span className="font-heading text-base font-semibold">
            {siteConfig.name}
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-muted-foreground">
        {siteConfig.tagline}
      </footer>
    </div>
  );
}
