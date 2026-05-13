import Image from "next/image";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import type React from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  Database,
  FileImage,
  FileSpreadsheet,
  FileUp,
  KeyRound,
  Link2,
  Mail,
  MessageSquareText,
  Repeat2,
  Server,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";
import { BrandWordmark } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
});

const navItems = [
  { label: "Product", href: "#product" },
  { label: "Security", href: "#security" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "/pricing" },
];

const problemPoints = [
  {
    title: "Feedback arrives out of context",
    description:
      "Album changes often show up as email paragraphs, screenshots, or vague spread references.",
  },
  {
    title: "Client portals add friction",
    description:
      "A proof should be easy to open, review, comment on, and approve without another account setup step.",
  },
  {
    title: "Approvals need a record",
    description:
      "Studios need comments, revisions, approvals, and exports tied back to the album version being reviewed.",
  },
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

const useCases = [
  {
    title: "Wedding album reviews",
    description:
      "Send a polished proof link after the album design is ready and keep feedback tied to each spread.",
    icon: BookOpen,
  },
  {
    title: "Client revision rounds",
    description:
      "Replace spreads, create new versions, and preserve the review history for the project.",
    icon: Repeat2,
  },
  {
    title: "Studio handoff",
    description:
      "Export CSV feedback so production notes can move cleanly into the next step of the workflow.",
    icon: FileSpreadsheet,
  },
];

const architectureFeatures = [
  {
    title: "Versioned proof model",
    description:
      "Projects contain album versions, spreads, comments, share links, approvals, and subscription state.",
    icon: Server,
  },
  {
    title: "Validated uploads",
    description:
      "JPG, PNG, and PDF imports validate file type, extension, size, storage-key safety, and dimensions where available.",
    icon: UploadCloud,
  },
  {
    title: "Dashboard operations",
    description:
      "The studio dashboard handles uploads, replacements, proof links, comment resolution, revision rounds, and CSV export.",
    icon: Users,
  },
];

const securityFeatures = [
  {
    title: "Hashed proof tokens",
    description:
      "Share tokens are generated with cryptographic randomness and stored as HMAC hashes.",
    icon: KeyRound,
  },
  {
    title: "Signed asset access",
    description:
      "Album spreads are served through signed asset routes instead of exposing private storage keys.",
    icon: ShieldCheck,
  },
  {
    title: "Scoped review sessions",
    description:
      "Dashboard access uses signed HTTP-only sessions, while proof access is scoped to share tokens and optional proof cookies.",
    icon: Clock3,
  },
];

const integrationBoundaries = [
  {
    title: "Design file inputs",
    description: "JPG, PNG, and PDF imports become reviewable proof spreads.",
    icon: FileImage,
  },
  {
    title: "Feedback export",
    description:
      "Project comments can be exported as CSV from the studio dashboard.",
    icon: FileSpreadsheet,
  },
  {
    title: "Supabase-ready data",
    description:
      "A Postgres migration exists for studios, clients, projects, versions, spreads, comments, approvals, and subscriptions.",
    icon: Database,
  },
  {
    title: "Billing and email boundaries",
    description:
      "Stripe checkout/webhook and Resend email boundaries are isolated behind server modules with local stubs.",
    icon: CreditCard,
  },
  {
    title: "Private storage target",
    description:
      "The local storage layer is designed to move to Supabase Storage or S3-compatible private object storage.",
    icon: Server,
  },
  {
    title: "Client share link",
    description:
      "Clients can review, comment, request changes, or approve from a tokenized proof URL.",
    icon: Mail,
  },
];

const heroChips = [
  "Private proof links",
  "Pinned spread comments",
  "Versioned revisions",
  "CSV feedback export",
];

const previewDetails = [
  {
    title: "Secure proof link",
    description: "Tokenized URL for client review.",
  },
  {
    title: "Pinned comments",
    description: "Feedback stays on the spread.",
  },
  {
    title: "Approval record",
    description: "Decision tied to the version.",
  },
];

export default function Home() {
  return (
    <main
      className="min-h-screen bg-[#fbfaf7] text-zinc-950"
      style={{
        fontFamily:
          '"SF Pro Text", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      }}
    >
      <nav className="fixed inset-x-0 top-0 z-30 px-3 pt-3 sm:px-5">
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-zinc-200/90 bg-white/90 px-4 shadow-[0_1px_1px_rgba(24,24,27,0.04)] backdrop-blur md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="justify-self-start"
            aria-label="Album Approve home"
          >
            <BrandWordmark className="text-[0.9rem] tracking-[0.32em] sm:text-[1.06rem] sm:tracking-[0.4em]" />
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
              className="h-10 bg-zinc-950 px-5 text-[0.84rem] text-white shadow-none hover:bg-zinc-800"
            >
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-16 px-4 pb-24 pt-36 sm:px-6 sm:pb-32 min-[920px]:min-h-[100svh] min-[920px]:grid-cols-[0.9fr_1.1fr] min-[920px]:items-center lg:px-8">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="h-7 border-emerald-200 bg-emerald-50 px-3 text-[0.76rem] font-medium text-emerald-700"
          >
            Online album proofing
          </Badge>
          <h1
            className={`${instrumentSerif.className} mt-7 max-w-[46rem] text-[clamp(2.2rem,5.2vw,4.2rem)] font-normal leading-[1.03] tracking-normal text-zinc-800`}
          >
            Album proofing without the{" "}
            <span className="text-emerald-500">email chase.</span>
          </h1>
          <p className="mt-6 max-w-[55ch] text-base leading-7 text-zinc-500">
            Upload exported album design files, send one private flip-through
            proof, and collect precise client comments without account setup or
            scattered email threads.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {heroChips.map((item) => (
              <span
                key={item}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
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
              className="gap-2 border-zinc-300 bg-white px-5 shadow-none"
            >
              <Link href="/proof/demo-proof-token">View client proof</Link>
            </Button>
          </div>
        </div>

        <ProductPreview />
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Problem"
            title="Album review breaks down when feedback leaves the design."
            description="Album Approve keeps every note, revision, and decision connected to the proof your client is reviewing."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {problemPoints.map((item) => (
              <article key={item.title} className="bg-white p-6">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="product"
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <SectionIntro
            eyebrow="Product"
            title="A focused review loop from upload to approval."
            description="The app starts after the album design is ready: upload the exported spreads, share the proof, gather exact feedback, and keep a record of what changed."
          />
          <div className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-4">
            {workflow.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="bg-[#fbfaf7] p-5">
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

      <section className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Use cases"
            title="Built around the moments studios repeat."
            description="Album Approve is intentionally narrow: final album proofs, client comments, revision rounds, and production handoff."
          />
          <IconGrid items={useCases} className="mt-10 md:grid-cols-3" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-2 shadow-[0_18px_55px_rgba(24,24,27,0.07)]">
            <Image
              src="/proofalbum-proofing.png"
              alt="Album Approve proof page showing album spread review and comment controls"
              width={1600}
              height={1000}
              className="aspect-[16/10] w-full rounded-md object-cover object-top"
            />
          </div>
          <SectionIntro
            eyebrow="Client experience"
            title="One private link. No training required."
            description="Clients move spread by spread, click the part of the layout that needs attention, and submit approval when the album is ready."
          />
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Architecture and features"
            title="Review features with clear server boundaries."
            description="Server Actions handle mutations, data access is centralized, and external services are isolated behind server modules so the app can run locally and move toward hosted infrastructure."
          />
          <IconGrid
            items={architectureFeatures}
            className="mt-10 md:grid-cols-3"
          />
        </div>
      </section>

      <section
        id="security"
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionIntro
            eyebrow="Security and trust"
            title="Private proofs, scoped access, and auditable decisions."
            description="The security model keeps dashboard users and proof guests separate while avoiding direct exposure of storage keys."
          />
          <IconGrid items={securityFeatures} className="md:grid-cols-3" />
        </div>
      </section>

      <section
        id="integrations"
        className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Workflow inputs and service boundaries"
            title="Connects where the review workflow actually needs it."
            description="Keep handoff simple with file imports, CSV export, tokenized proof links, and isolated service boundaries for data, billing, email, and private storage."
          />
          <IconGrid
            items={integrationBoundaries}
            className="mt-10 md:grid-cols-2 lg:grid-cols-3"
          />
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white shadow-[0_18px_50px_rgba(24,24,27,0.12)] sm:p-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Studio workspace
            </p>
            <h2
              className={`${instrumentSerif.className} mt-4 max-w-3xl text-[clamp(1.8rem,3vw,2.6rem)] font-normal leading-[1.08] tracking-normal`}
            >
              Open the workspace, upload album design files, and share a
              flippable proof with comments.
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

      <footer className="border-t border-zinc-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Album Approve</span>
          <span>©2026 SUPREME AI VENTURES LLC</span>
        </div>
      </footer>
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="min-[920px]:pt-24">
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_18px_55px_rgba(24,24,27,0.08)]">
        <div className="flex h-9 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4">
          <span className="size-2.5 rounded-full bg-zinc-300" />
          <span className="size-2.5 rounded-full bg-zinc-300" />
          <span className="size-2.5 rounded-full bg-zinc-300" />
          <span className="ml-3 text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-zinc-400">
            Client proof preview
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
        {previewDetails.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
          >
            <p className="text-sm font-semibold tracking-tight">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">
        {eyebrow}
      </p>
      <h2
        className={`${instrumentSerif.className} mt-4 text-[clamp(1.5rem,3vw,2.4rem)] font-normal leading-[1.1] tracking-normal text-zinc-800`}
      >
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-[0.95rem] leading-7 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function IconGrid({
  items,
  className,
}: {
  items: Array<{
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  }>;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 ${className || ""}`}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.title} className="bg-[#fbfaf7] p-6">
            <Icon className="size-5 text-zinc-500" aria-hidden />
            <h3 className="mt-8 text-base font-semibold">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {item.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
