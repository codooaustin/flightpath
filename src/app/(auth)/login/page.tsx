"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, PlaneTakeoff } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back, aviator"
      subtitle="Sign in to pick up your flight plan where you left off."
      footer={
        <>
          New to Flight Path?{" "}
          <Link href="/signup" className="font-medium text-sky-600 hover:underline">
            Create your account
          </Link>
        </>
      }
    >
      <form action={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="captain@flightpath.app"
            autoComplete="email"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full gap-2 bg-sky-600 text-white hover:bg-sky-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <LogIn className="h-4 w-4" />
              Contacting tower...
            </>
          ) : (
            <>
              <PlaneTakeoff className="h-4 w-4" />
              Sign in
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Your logbook, missions, and training progress sync when you return.
        </p>
      </form>
    </AuthShell>
  );
}
