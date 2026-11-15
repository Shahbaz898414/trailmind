"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, CloudOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isFirebaseConfigured } from "@/lib/firebase/config";

type AuthFormProps = {
  mode: "login" | "signup";
};

/**
 * Presentational auth form for `/login` and `/signup`.
 *
 * Firebase Auth is NOT wired up yet — this project has no Firebase
 * credentials, and inventing a sign-in flow would be misleading. Submitting
 * shows the exact reason instead of pretending to succeed.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus(
      isFirebaseConfigured
        ? "Firebase is configured, but the sign-in handler has not been implemented yet."
        : "Firebase Auth is not configured yet. Copy .env.example to .env.local and add your Firebase web app values."
    );
  }

  const isLogin = mode === "login";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="space-y-1">
        <h1 className="font-heading text-xl font-semibold">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin
            ? "Sign in to pick up your trips where you left off."
            : "Start planning trips that keep working without a connection."}
        </p>
      </div>

      <div className="space-y-3">
        {!isLogin ? (
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Alex Rivera"
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {isLogin ? "Sign in" : "Create account"}
        <ArrowRight aria-hidden />
      </Button>

      {status ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs text-foreground"
        >
          <CloudOff className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{status}</span>
        </p>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            No account yet?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
