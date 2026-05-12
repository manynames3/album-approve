import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileUp,
  Link2,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { BrandWordmark } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Workflow", href: "#workflow" },
  { label: "Proof", href: "#proof" },
  { label: "Pricing", href: "/pricing" },
];

const workflow = [
  {
    title: "Upload",
    description: "Add exported JPG, PNG, or PDF album spreads to a project.",
    icon: FileUp,
  },
  {
    title: "Share",
    description: "Create one private proof link for the client review.",
    icon: Link2,
  },
  {
    title: "Comment",
    description: "Collect pinned notes on the exact spread that needs edits.",
    icon: MessageSquareText,
  },
  {
    title: "Approve",
    description: "Track revisions, resolve notes, and capture the decision.",
    icon: CheckCircle2,
  },
];

const details = [
  "No client account required",
  "Pinned comments by spread",
  "CSV feedback export",
  "Versioned revision rounds",
  "Tokenized proof links",
  "Local demo data boundary",
];

const proofStats = [
  { value: "4", label: "sample spreads" },
  { value: "1", label: "open client note" },
  { value: "0", label: "client logins" },
];

const highlights = [
  {
    title: "Made for the post-design handoff",
    description:
      "The workflow begins once the album has been designed and exported, so studios can review final spreads without rebuilding their design process.",
    icon: BookOpen,
  },
  {
    title: "Private by default",
    description:
      "Share links use stored token hashes and album assets are served through signed routes instead of public file paths.",
    icon: ShieldCheck,
  },
  {
    title: "Fast enough for revision rounds",
    description:
      "Upload replacement spreads, keep comments tied to versions, and move the approval forward without scattered email threads.",
    icon: Clock3,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f6f2] text-zinc-950">
      <nav className="fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-5">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-zinc-200/90 bg-[#fbfaf6]/90 px-4 shadow-[0_1px_1px_rgba(24,24,27,0.04)] backdrop-blur md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="justify-self-start"
            aria-label="Album Approve home"
          >
            <BrandWordmark className="text-[0.95rem] tracking-[0.34em] sm:text-[1.18rem] sm:tracking-[0.42em]" />
          </Link>
          <div className="hidden items-center gap-8 justify-self-center text-sm font-medium text-zinc-600 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3 justify-self-end">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 sm:inline-flex"
            >
              Log in
            </Link>
            <Button
              asChild
              className="h-10 bg-zinc-950 px-5 text-white shadow-none hover:bg-zinc-800"
            >
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-32 sm:px-6 min-[900px]:min-h-[84svh] min-[900px]:grid-cols-[0.95fr_1.05fr] min-[900px]:items-center lg:px-8">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="h-7 border-emerald-200 bg-emerald-50 px-3 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-emerald-700"
          >
            Online album proofing
          </Badge>
          <h1 className="mt-6 text-5xl font-semibold leading-[0.95] tracking-tight text-zinc-700 sm:text-6xl xl:text-7xl">
            Album approvals,
            <br />
            exactly where you{" "}
            <span className="text-emerald-500">left them.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
            Upload exported album design files, send one private flip-through
            proof, and collect precise client comments without account setup or
            email archaeology.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {["JPG", "PNG", "PDF", "Private link", "Pinned notes"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500"
                >
                  {item}
                </span>
              ),
            )}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2 bg-emerald-600 px-5">
              <Link href="/sign-in">
                Open workspace
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-zinc-300 bg-white/80 px-5 shadow-none"
            >
              <Link href="/proof/demo-proof-token">View client proof</Link>
            </Button>
          </div>
        </div>

        <div className="min-[900px]:pt-16">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_18px_50px_rgba(24,24,27,0.08)]">
            <div className="flex h-9 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4">
              <span className="size-2.5 rounded-full bg-zinc-300" />
              <span className="size-2.5 rounded-full bg-zinc-300" />
              <span className="size-2.5 rounded-full bg-zinc-300" />
              <span className="ml-3 text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-zinc-400">
                Client proof replay
              </span>
            </div>
            <Image
              src="/proofalbum-proofing.png"
              alt="Album Approve client proofing page with a flip-through album spread and comment controls"
              width={1600}
              height={1000}
              priority
              className="aspect-[16/10] w-full object-cover object-top"
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {proofStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-zinc-200 bg-white/80 px-4 py-3"
              >
                <p className="text-xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="border-y border-zinc-200 bg-white px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Studio workflow
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              A simple path from exported files to approved album.
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              The app stays focused on the review layer: file upload, proof
              sharing, comments, revisions, and final approval.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-4">
            {workflow.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="bg-[#fbfaf6] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="size-5 text-emerald-600" aria-hidden />
                    <span className="text-xs font-semibold text-zinc-400">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="proof"
        className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8"
      >
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-2 shadow-[0_14px_45px_rgba(24,24,27,0.06)]">
          <Image
            src="/proofalbum-proofing.png"
            alt="Album proof workspace showing album spread review"
            width={1600}
            height={1000}
            className="aspect-[16/10] w-full rounded-md object-cover object-top"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Client experience
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            One private link. No training required.
          </h2>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Clients move spread by spread, click the part of the layout that
            needs attention, and submit approval when the album is ready.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden />
                <span className="text-zinc-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Engineering notes
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Clean product surface, credible internals.
            </h2>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="bg-[#fbfaf6] p-6">
                  <Icon className="size-5 text-zinc-500" aria-hidden />
                  <h3 className="mt-8 text-base font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white sm:p-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Seeded demo
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
              Log in to upload album design files and manage a live proofing
              workspace.
            </h2>
          </div>
          <Button asChild size="lg" className="gap-2 bg-white text-zinc-950">
            <Link href="/sign-in">
              Continue to workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-zinc-200 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          ©2026 SUPREME AI VENTURES LLC
        </div>
      </footer>
    </main>
  );
}
