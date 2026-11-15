import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CloudOff, Download, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Get started",
  description: "A short tour of what TrailMind does before you plan your first trip.",
};

const steps = [
  {
    icon: Sparkles,
    title: "Create a trip",
    body: "Add a destination and dates. Your itinerary is written to IndexedDB first, so it is saved even if you are offline.",
  },
  {
    icon: Download,
    title: "Download the offline pack",
    body: "Bundle the places, notes and phrasebook you need so they are on the device before you lose signal.",
  },
  {
    icon: CloudOff,
    title: "Ask the assistant anywhere",
    body: "Firebase AI Logic answers on-device when it can and in the cloud when you are connected.",
  },
] as const;

export default function OnboardingPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold">
          Three steps, then you are travelling
        </h1>
        <p className="text-sm text-muted-foreground">
          This is the flow the app will walk every new account through.
        </p>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Card size="sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-sm">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-forest text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <step.icon className="size-3.5 text-brand-forest" aria-hidden />
                    {step.title}
                  </span>
                </CardTitle>
                <CardDescription>{step.body}</CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ol>

      <Link
        href="/dashboard"
        className={`${buttonVariants({ className: "w-full" })}`}
      >
        Go to the dashboard
        <ArrowRight aria-hidden />
      </Link>

      <p className="text-center text-xs text-muted-foreground">
        Sign-up and onboarding are not wired to Firebase Auth yet.
      </p>
    </div>
  );
}
