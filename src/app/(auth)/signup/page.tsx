import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a TrailMind account and start planning offline-first trips.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
