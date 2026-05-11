import Link from "next/link";
import Image from "next/image";
import {
  Album,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileUp,
  Link2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const workflow = [
  {
    title: "Upload exported designs",
    description:
      "Drop JPG, PNG, or PDF album spread files into a versioned studio project.",
    icon: FileUp,
  },
  {
    title: "Share a private flip-through proof",
    description:
      "Send a secure link where clients can move spread by spread and review the album in order.",
    icon: BookOpen,
  },
  {
    title: "Collect pinned comments",
    description:
      "Clients click the exact spot on a spread and leave clear change requests.",
    icon: MessageSquareText,
  },
  {
    title: "Close the approval loop",
    description:
      "Resolve notes, create revision rounds, export CSV feedback, and capture approval.",
    icon: CheckCircle2,
  },
];

const highlights = [
  {
    title: "Client links stay private",
    description:
      "Proof tokens are stored as hashes and album assets are served through expiring signed routes.",
    icon: ShieldCheck,
  },
  {
    title: "Fast handoff after design",
    description:
      "No client account setup. Upload the exported album, create a link, and keep the review moving.",
    icon: Clock3,
  },
  {
    title: "Built for revision rounds",
    description:
      "Every project tracks versions, comments, resolved status, approval decisions, and proof activity.",
    icon: Link2,
  },
];

const proofPoints = [
  "PDF imports become reviewable proof spreads",
  "Keyboard and button navigation for flip-through review",
  "Pinned comments tied to exact spreads",
  "Approval and change-request decisions",
  "Studio dashboard with CSV feedback export",
];

export default function Home() {
  return (
    <main className="bg-white text-zinc-950">
      <nav className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-white"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
              <Album className="size-4" aria-hidden="true" />
            </span>
            ProofAlbum
          </Link>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button
              asChild
              className="bg-white text-zinc-950 hover:bg-zinc-100"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section
        className="relative isolate flex min-h-[82vh] items-end overflow-hidden bg-zinc-950 px-4 pb-16 pt-28 text-white sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.78) 42%, rgba(9,9,11,0.26) 100%), url('/proofalbum-proofing.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/10 text-white"
            >
              Online album proofing for photographers
            </Badge>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
              Upload the album design. Send one clean proof link.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-200">
              ProofAlbum turns exported album spreads into a private,
              flip-through client review with pinned comments, revision rounds,
              and approval tracking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-white text-zinc-950 hover:bg-zinc-100"
              >
                <Link href="/sign-in">
                  Open the demo
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-zinc-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          <Stat value="4" label="demo album spreads" />
          <Stat value="1" label="open client comment" />
          <Stat value="0" label="client accounts required" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="border-teal-200 bg-teal-50 text-teal-800"
          >
            Workflow
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight">
            From exported design files to client approval
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            The app starts after the album design is ready. Upload the exported
            spreads, share the proof, gather exact feedback, and keep a record
            of what changed.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflow.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-medium text-zinc-400">
                      0{index + 1}
                    </span>
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/10 text-white"
            >
              Client review
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              A flip-through proof that clients can actually comment on
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              Clients do not need a dashboard. They open the secure link, move
              through the album, click where something needs attention, and
              submit approval when the design is ready.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-zinc-200">
              {proofPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-teal-300" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/10 p-3 shadow-2xl">
            <Image
              src="/proofalbum-proofing.png"
              alt="ProofAlbum client proofing page with album spread review and comment controls"
              width={1600}
              height={1000}
              className="aspect-[16/10] w-full rounded-lg object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-amber-800"
            >
              Why it matters
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Less back-and-forth after every album reveal
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Album changes usually arrive as scattered emails and vague notes.
              ProofAlbum keeps the review tied to the design file, the spread,
              the version, and the final decision.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title}>
                  <CardHeader>
                    <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t bg-zinc-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-teal-700">
              <Sparkles className="size-4" aria-hidden="true" />
              Seeded portfolio demo
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Log in and upload album design files from the studio dashboard.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              The demo opens into a real project workspace where you can upload
              design spreads, replace pages, create a proof link, and share the
              flippable review with a client.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/sign-in">
              Continue to workspace
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{label}</p>
    </div>
  );
}
