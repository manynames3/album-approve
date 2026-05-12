import Link from "next/link";
import type React from "react";
import { CheckCircle2, MessageSquareText, ShieldCheck } from "lucide-react";
import { signInAction } from "@/app/actions/auth";
import { BrandMark, BrandWordmark } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen bg-zinc-100 px-4 py-8 lg:grid-cols-[1fr_460px] lg:px-8">
      <section className="hidden min-h-[calc(100vh-4rem)] flex-col justify-between rounded-xl border bg-zinc-950 p-8 text-white lg:flex">
        <Link
          href="/"
          className="flex items-center gap-3 text-sm font-semibold"
          aria-label="Album Approve home"
        >
          <BrandWordmark className="text-[0.9rem] tracking-[0.3em]" />
        </Link>
        <div className="max-w-xl">
          <Badge
            variant="outline"
            className="border-white/20 bg-white/10 text-white"
          >
            Local demo
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Review albums, collect notes, and close approvals.
          </h1>
          <div className="mt-8 grid gap-3 text-sm text-zinc-300">
            <DemoPoint icon={ShieldCheck} label="Private signed proof links" />
            <DemoPoint
              icon={MessageSquareText}
              label="Pinned spread-level feedback"
            />
            <DemoPoint icon={CheckCircle2} label="Versioned approvals" />
          </div>
        </div>
        <p className="text-sm text-zinc-400">
          Seeded with the Harper Wedding Album workflow.
        </p>
      </section>

      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center lg:px-8">
        <Card className="w-full max-w-md bg-white">
          <CardHeader>
            <BrandMark className="mb-2 lg:hidden" />
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use any email to enter the local Album Approve demo workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={signInAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue="demo@proofalbum.test"
                  required
                />
              </div>
              <Button className="w-full">Continue</Button>
            </form>
            <p className="mt-4 text-sm text-zinc-600">
              New studio?{" "}
              <Link href="/sign-up" className="font-medium text-teal-700">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function DemoPoint({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
        <Icon className="size-4" aria-hidden={true} />
      </div>
      <span>{label}</span>
    </div>
  );
}
