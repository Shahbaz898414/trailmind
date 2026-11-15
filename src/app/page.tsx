import Link from "next/link";
import { ArrowRight, Bot, CloudOff, Compass, MapPin, Wifi } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/constants/site";

const features = [
  {
    icon: CloudOff,
    title: "Works without internet",
    body: "Itineraries, saved places, budget and phrasebook are stored on-device in IndexedDB, so they stay available in airplane mode.",
  },
  {
    icon: Bot,
    title: "Hybrid AI routing",
    body: "Firebase AI Logic prefers Chrome's on-device model and falls back to Gemini in the cloud when you are connected.",
  },
  {
    icon: MapPin,
    title: "Everything in one place",
    body: "Trips, wallet, offline packs and saved places share one offline-first data layer that syncs to Firestore later.",
  },
] as const;

/** Public front door — routes into the dashboard shell. */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-accent text-brand-forest">
            <Compass className="size-5" aria-hidden />
          </span>
          <span className="font-heading text-base font-semibold">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className={`${buttonVariants({ variant: "ghost" })} hidden sm:inline-flex`}
          >
            Sign in
          </Link>
          <Link href="/dashboard" className={buttonVariants()}>
            Open dashboard
            <ArrowRight aria-hidden />
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 py-14 text-center sm:px-8 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Wifi className="size-3.5 text-brand-forest" aria-hidden />
            Built for the Firebase Hybrid AI Hackathon 2026
          </span>

          <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {siteConfig.tagline}
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              Explore the dashboard
              <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Create an account
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="gap-3">
                <CardContent className="flex h-full flex-col gap-2 p-0">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-forest/10 text-brand-forest">
                    <feature.icon className="size-5" aria-hidden />
                  </span>
                  <h2 className="font-heading text-base font-semibold">
                    {feature.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Offline AI and full sync are still being implemented and verified —
            nothing here claims to work before it has been tested in Chrome.
          </p>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground sm:px-8">
        {siteConfig.name} · {siteConfig.description.split(":")[0]}
      </footer>
    </div>
  );
}
