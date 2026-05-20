import Image from "next/image";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import type React from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  FileSpreadsheet,
  FileUp,
  KeyRound,
  Link2,
  LockKeyhole,
  MessageSquareText,
  Repeat2,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { BrandWordmark } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
});

const navItems = [
  { label: "Problem", href: "#problem" },
  { label: "Workflow", href: "#workflow" },
  { label: "Trust", href: "#trust" },
  { label: "Access", href: "#access" },
  { label: "FAQ", href: "#faq" },
];

const proofPromise = [
  "Send one private album proof",
  "Keep comments pinned to spreads",
  "Capture approval before print",
];

const painfulWorkflow = [
  {
    title: "Screenshots replace context",
    description:
      "A client circles a phone screenshot, forwards a marked-up PDF, or writes 'page three' when they mean the fourth spread.",
  },
  {
    title: "Revision notes scatter across channels",
    description:
      "Email, texts, PDFs, and studio notes all describe the same album, but none of them become one reliable change list.",
  },
  {
    title: "Approval becomes hard to prove",
    description:
      "When the album is ready for production, the studio still has to confirm which version was approved and what comments were resolved.",
  },
];

const solutionSteps = [
  {
    title: "Upload the exported spreads",
    description:
      "Add JPG, PNG, or PDF album design files to a client project after the layout is ready for review.",
    icon: FileUp,
  },
  {
    title: "Send one proof link",
    description:
      "Share a tokenized client proof that opens in the browser, flips through the album, and can be password protected.",
    icon: Link2,
  },
  {
    title: "Resolve feedback before production",
    description:
      "See spread-level notes, create revised versions, export CSV feedback, and capture the final approval decision.",
    icon: CheckCircle2,
  },
];

const coreBenefits = [
  {
    title: "Fewer ambiguous edits",
    description:
      "Pinned notes stay attached to the exact spread, so a designer is not guessing which image, page, or layout area changed.",
    icon: MessageSquareText,
  },
  {
    title: "Shorter review rounds",
    description:
      "Clients can open one link, move through the album, leave comments, and approve without creating an account.",
    icon: Clock3,
  },
  {
    title: "Cleaner production handoff",
    description:
      "Export comments as CSV and keep revision history tied to the album version that was reviewed.",
    icon: FileSpreadsheet,
  },
  {
    title: "Less approval risk",
    description:
      "Approval records attach to a version, helping the studio avoid sending the wrong album to print.",
    icon: ShieldCheck,
  },
];

const useCases = [
  {
    title: "Wedding album proof delivery",
    description:
      "Send a polished proof after the first album design is ready and keep the client review out of your inbox.",
    icon: BookOpen,
  },
  {
    title: "Revision rounds with image swaps",
    description:
      "Create a new version after layout changes, then preserve old notes while the client reviews the updated spreads.",
    icon: Repeat2,
  },
  {
    title: "Studio-to-designer handoff",
    description:
      "Turn client comments into a clean change list for an internal designer, album company, or production assistant.",
    icon: Users,
  },
  {
    title: "Final approval before print",
    description:
      "Collect the final decision against the current version before the album moves into ordering or production.",
    icon: CheckCircle2,
  },
];

const differentiation = [
  {
    question: "Why not just use ChatGPT?",
    answer:
      "ChatGPT can help write emails. It does not host private album spreads, pin feedback to a layout, track versions, or capture a client approval record.",
  },
  {
    question: "Why not spreadsheets?",
    answer:
      "A spreadsheet can track tasks after the fact. It does not give the client a visual proofing experience or prevent vague notes from entering the workflow.",
  },
  {
    question: "Why not Zapier or n8n?",
    answer:
      "Automation tools can move data between systems. They do not replace the client-facing review surface where the feedback is created.",
  },
  {
    question: "Why not keep doing it manually?",
    answer:
      "Manual proofing works until revisions pile up. The cost is time spent interpreting notes, chasing approvals, and rebuilding the same handoff list.",
  },
];

const trustSignals = [
  {
    title: "Tokenized proof links",
    description:
      "Proof links use generated tokens, and newly created share tokens are stored as HMAC hashes.",
    icon: KeyRound,
  },
  {
    title: "Private asset routes",
    description:
      "Album spreads are served through signed routes instead of exposing direct storage keys.",
    icon: LockKeyhole,
  },
  {
    title: "Separate guest access",
    description:
      "Dashboard sessions and client proof access are separated, with optional proof passwords supported.",
    icon: ShieldCheck,
  },
  {
    title: "Preview data boundary",
    description:
      "Use the public preview with sample albums. Live client work should run on configured private storage, email, billing, and rate limits.",
    icon: Database,
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Evaluate the proofing workflow with one active album.",
    features: ["1 active album", "1 GB private storage", "Basic review"],
  },
  {
    name: "Starter",
    price: "$12/mo",
    description: "For photographers sending regular album proofs.",
    features: [
      "10 active albums",
      "20 GB private storage",
      "Revision history",
      "Custom branding",
    ],
    featured: true,
  },
  {
    name: "Pro",
    price: "$29/mo",
    description: "For studios with steady album volume.",
    features: [
      "Unlimited active albums",
      "100 GB private storage",
      "Revision history",
      "Custom branding",
    ],
  },
];

const faqItems = [
  {
    question: "Who is Album Approve for?",
    answer:
      "Wedding and portrait photographers, album designers, and small studios that send album spreads to clients for review before production.",
  },
  {
    question: "How is this different from generic AI tools?",
    answer:
      "This is not an AI writing tool. It is a focused album proofing workflow: upload spreads, share a proof link, collect visual comments, manage revisions, and record approval.",
  },
  {
    question: "What setup is required?",
    answer:
      "For the current preview, you can open the workspace and client proof from the site. A live studio rollout should configure private storage, email delivery, billing, rate limits, and a strong app secret.",
  },
  {
    question: "Is my data safe?",
    answer:
      "The app uses tokenized proof links, optional proof passwords, signed asset access, and separate dashboard/proof sessions. Use sample albums in the preview until a production deployment is configured for real client work.",
  },
  {
    question: "What happens after I sign up or request access?",
    answer:
      "The current CTA opens the workspace preview so you can inspect the album proofing flow. It does not collect payment details on the preview deployment.",
  },
  {
    question: "What does this replace?",
    answer:
      "It replaces the parts of album proofing that normally happen across email threads, marked-up PDFs, screenshots, spreadsheets, and manual approval tracking.",
  },
  {
    question: "What does this not do yet?",
    answer:
      "It does not generate album designs, automate print ordering, provide a full team permission model, or claim compliance certifications. Those are outside the current product scope.",
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
        <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-zinc-200/90 bg-white/92 px-4 shadow-[0_1px_1px_rgba(24,24,27,0.04)] backdrop-blur md:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/"
            className="justify-self-start"
            aria-label="Album Approve home"
          >
            <BrandWordmark className="text-[0.82rem] tracking-[0.18em] sm:text-[1.05rem] sm:tracking-[0.36em]" />
          </Link>
          <div className="hidden items-center gap-7 justify-self-center text-sm font-medium text-zinc-600 md:flex">
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
              <Link href="/proof/demo-proof-token">
                <span className="sm:hidden">Demo</span>
                <span className="hidden sm:inline">View Demo Proof</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-36 sm:px-6 sm:pb-32 min-[980px]:min-h-[100svh] min-[980px]:grid-cols-[0.9fr_1.1fr] min-[980px]:items-center lg:px-8">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="h-7 rounded-md border-teal-200 bg-teal-50 px-3 text-[0.76rem] font-medium text-teal-800"
          >
            Wedding album proofing for photographers
          </Badge>
          <h1
            className={`${instrumentSerif.className} mt-7 max-w-[48rem] text-[clamp(2.35rem,5.5vw,4.8rem)] font-normal leading-[1.02] tracking-normal text-zinc-900`}
          >
            Get wedding albums approved without the email chase.
          </h1>
          <p className="mt-6 max-w-[58ch] text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
            Album Approve helps photographers send one polished proof, collect
            spread-specific client comments, and capture approval before the
            album goes to print.
          </p>
          <div className="mt-8 grid max-w-xl gap-2">
            {proofPromise.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm font-medium text-zinc-700"
              >
                <CheckCircle2 className="size-4 text-teal-700" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="gap-2 bg-teal-700 px-5">
              <Link href="/proof/demo-proof-token">
                View demo proof
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-zinc-300 bg-white px-5 shadow-none"
            >
              <Link href="/sign-up">Try studio workspace</Link>
            </Button>
          </div>
          <p className="mt-5 max-w-[50ch] text-sm leading-6 text-zinc-500">
            No payment required for the preview. Use the sample wedding album to
            inspect the client and studio workflow.
          </p>
        </div>

        <ProductPreview />
      </section>

      <section
        id="problem"
        className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="The problem"
            title="Album feedback is too expensive to interpret by hand."
            description="Your clients are not trying to be difficult. The old workflow gives them too many ways to describe a visual change without keeping that note attached to the spread."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {painfulWorkflow.map((item) => (
              <article key={item.title} className="bg-white p-6">
                <XCircle className="size-5 text-zinc-400" aria-hidden />
                <h3 className="mt-8 text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="workflow"
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <SectionIntro
            eyebrow="The workflow"
            title="A clear path from exported spread to final approval."
            description="Album Approve starts after the design is ready. It gives the studio a review surface, not another generic project board."
          />
          <div className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {solutionSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="bg-[#fbfaf7] p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Icon className="size-5 text-teal-700" aria-hidden />
                    <span className="text-xs font-semibold text-zinc-400">
                      0{index + 1}
                    </span>
                  </div>
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

      <section className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Core benefits"
            title="Less translation work between client, studio, and production."
            description="The value is not more software. The value is fewer revision mistakes, fewer follow-up emails, and a cleaner decision record."
          />
          <IconGrid items={coreBenefits} className="mt-10 md:grid-cols-2" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white p-2 shadow-[0_18px_55px_rgba(24,24,27,0.07)]">
            <Image
              src="/proofalbum-proofing.png"
              alt="Album Approve client proof page showing a wedding album spread with comments and decision controls"
              width={1600}
              height={1000}
              className="aspect-[16/10] w-full rounded-md object-cover object-top"
            />
          </div>
          <SectionIntro
            eyebrow="Client experience"
            title="Clients review the album where the album actually is."
            description="They can flip through the spreads, zoom in for detail, click the layout to place a note, and submit either approval or a change request."
          />
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Use cases"
            title="Built for the album review moments studios repeat every week."
            description="This is intentionally narrow. It is for album proofing, revision tracking, and approval handoff."
          />
          <IconGrid
            items={useCases}
            className="mt-10 md:grid-cols-2 lg:grid-cols-4"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <SectionIntro
            eyebrow="Why this"
            title="This solves the review surface, not just the admin around it."
            description="Generic tools can help after feedback exists. Album Approve is where the client creates clear feedback in the first place."
          />
          <div className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-2">
            {differentiation.map((item) => (
              <article key={item.question} className="bg-[#fbfaf7] p-6">
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="trust"
        className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Trust"
            title="Built for private album review, with clear preview limits."
            description="Client proofs use tokenized links, optional passwords, signed asset access, and separate guest review sessions. Use the public preview with sample albums until a production deployment is configured for real client work."
          />
          <IconGrid
            items={trustSignals}
            className="mt-10 md:grid-cols-2 lg:grid-cols-4"
          />
        </div>
      </section>

      <section
        id="access"
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <SectionIntro
              eyebrow="Pricing and access"
              title="Preview the workflow first. Pay only for a configured studio rollout."
              description="The intended plan structure is shown here, but this deployment is for evaluation. Open the workspace, review the sample album, and confirm whether the proofing loop fits your studio before payment is collected."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Until a sales intake form is wired, route interested studios to the existing workspace preview. */}
              <Button asChild size="lg" className="gap-2 bg-teal-700 px-5">
                <Link href="/sign-up">
                  Try studio workspace
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-zinc-300 bg-white px-5 shadow-none"
              >
                <Link href="/pricing">Review plan structure</Link>
              </Button>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-500">
              Preview note: do not upload real client work here unless the
              deployment is configured with private storage, email, billing, and
              rate limits.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`bg-white p-6 ${
                  plan.featured ? "shadow-[inset_0_0_0_1px_#0f766e]" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  {plan.featured ? (
                    <Badge className="rounded-md bg-teal-700 text-white">
                      Common
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-4 text-3xl font-semibold text-zinc-950">
                  {plan.price}
                </p>
                <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-zinc-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-teal-700"
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="border-y border-zinc-200 bg-white px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="FAQ"
            title="Straight answers before you trust this with client work."
            description="Use the preview to judge the proofing workflow. Production use should be configured before this replaces your current client album process."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article key={item.question} className="bg-white p-6">
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-lg border border-zinc-200 bg-zinc-950 p-6 text-white shadow-[0_18px_50px_rgba(24,24,27,0.12)] sm:p-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
              Ready to inspect the workflow?
            </p>
            <h2
              className={`${instrumentSerif.className} mt-4 max-w-3xl text-[clamp(1.8rem,3vw,2.75rem)] font-normal leading-[1.08] tracking-normal`}
            >
              Open the sample proof, then view the studio workspace behind it.
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="gap-2 bg-white text-zinc-950">
              <Link href="/proof/demo-proof-token">
                View demo proof
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-white/25 bg-transparent text-white hover:bg-white hover:text-zinc-950"
            >
              <Link href="/sign-up">Try workspace</Link>
            </Button>
          </div>
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
    <div className="min-[980px]:pt-20">
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
        <PreviewDetail
          title="Open"
          description="The client reviews the album from one private link."
          icon={Link2}
        />
        <PreviewDetail
          title="Comment"
          description="Notes stay attached to the spread they describe."
          icon={MessageSquareText}
        />
        <PreviewDetail
          title="Approve"
          description="The decision is tied to the reviewed version."
          icon={CheckCircle2}
        />
      </div>
    </div>
  );
}

function PreviewDetail({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <Icon className="size-4 text-teal-700" aria-hidden />
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
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
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
        {eyebrow}
      </p>
      <h2
        className={`${instrumentSerif.className} mt-4 text-[clamp(1.55rem,3vw,2.55rem)] font-normal leading-[1.1] tracking-normal text-zinc-900`}
      >
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-[0.98rem] leading-7 text-zinc-600">
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
