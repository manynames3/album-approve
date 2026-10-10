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
import { SampleAlbumPreview } from "@/components/marketing/sample-album-preview";
import { DEMO_ALBUM_ASSETS } from "@/lib/demo-album";
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
      "Add exported JPG or PNG spreads to a client project after the layout is ready for review.",
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
      "Uploaded album spreads use signed private routes. The fictional sample album is public.",
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
      "It does not create album designs or order prints. JPG and PNG spreads show your actual design; PDF imports currently produce page placeholders, not rendered previews. Production auth, durable hosted storage, and rate limits still need configuration before real client work.",
  },
];

export default function Home() {
  return (
    <main
      className="min-h-screen bg-white text-zinc-950"
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

      <section className="mx-auto max-w-7xl px-4 pt-24 pb-20 sm:px-6 sm:pt-40 sm:pb-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium text-teal-700">
            Wedding album proofing for photographers
          </p>
          <h1
            className={`${instrumentSerif.className} mt-4 text-[36px] font-normal leading-[1.06] tracking-normal text-zinc-900 sm:text-[56px] lg:text-[64px]`}
          >
            Album approvals.
            <br /> Without the email chase.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-500">
            Share wedding album designs in one link. Collect precise client
            feedback and record approval before print.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 bg-teal-700 px-5">
              <Link href="/proof/demo-proof-token">
                View demo proof <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-8 border-transparent bg-white px-5 text-zinc-600 shadow-none sm:h-10 sm:border-zinc-200"
            >
              <Link href="/sign-up">Try studio workspace</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-400">
            No payment required. Sample files only.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-6xl sm:mt-16">
          <SampleAlbumPreview />
          <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
            {proofPromise.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 text-xs text-zinc-500"
              >
                <CheckCircle2 className="size-3.5 text-teal-700" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </div>
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
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {painfulWorkflow.map((item) => (
              <article
                key={item.title}
                className="border-t border-zinc-200 pt-6"
              >
                <XCircle className="size-5 text-zinc-400" aria-hidden />
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
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
          <div className="grid gap-8 md:grid-cols-3">
            {solutionSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="border-t border-zinc-200 pt-6"
                >
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
          <figure className="min-w-0">
            <Image
              src={DEMO_ALBUM_ASSETS[2].src}
              alt="The full, uncropped portrait spread from the generated sample wedding album"
              width={DEMO_ALBUM_ASSETS[2].width}
              height={DEMO_ALBUM_ASSETS[2].height}
              unoptimized
              className="h-auto w-full border border-zinc-200 shadow-[0_10px_36px_rgba(24,24,27,0.06)]"
            />
            <figcaption className="mt-3 text-xs text-zinc-400">
              Portraits from the generated sample wedding album.
            </figcaption>
          </figure>
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
          <div className="grid gap-8 md:grid-cols-2">
            {differentiation.map((item) => (
              <article
                key={item.question}
                className="border-t border-zinc-200 pt-6"
              >
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
        className="mx-auto max-w-5xl scroll-mt-24 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium text-teal-700">
            Explore Album Approve
          </p>
          <h2
            className={`${instrumentSerif.className} mt-4 text-[32px] font-normal leading-[1.1] sm:text-[40px]`}
          >
            See how album approval should feel.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-500">
            Try the client proof. Explore the studio workspace. No payment
            required.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <article className="flex min-w-0 flex-col rounded-lg border border-teal-700/25 bg-white p-6 shadow-[0_4px_24px_rgba(24,24,27,0.04)] sm:p-8">
            <BookOpen className="size-5 text-teal-700" aria-hidden />
            <h3 className="mt-6 text-xl font-semibold">The client view</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              One album link. Precise feedback. A clear approval decision.
            </p>
            <ul className="my-7 space-y-3 text-sm text-zinc-600">
              {[
                "Four sample wedding spreads",
                "Full-screen detail and pinned comments",
                "No client login",
              ].map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-teal-700"
                    aria-hidden
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-auto w-full gap-2 bg-teal-700 shadow-none hover:bg-teal-800"
            >
              <Link href="/proof/demo-proof-token">
                Open sample proof <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </article>
          <article className="flex min-w-0 flex-col rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
            <FileUp className="size-5 text-zinc-500" aria-hidden />
            <h3 className="mt-6 text-xl font-semibold">The studio workspace</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Keep spreads, revisions, and client notes together.
            </p>
            <ul className="my-7 space-y-3 text-sm text-zinc-600">
              {[
                "JPG and PNG uploads",
                "Album version history",
                "CSV feedback export",
              ].map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-zinc-400"
                    aria-hidden
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="mt-auto w-full gap-2 border-zinc-300 bg-white shadow-none"
            >
              <Link href="/sign-up">
                Try studio workspace{" "}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </article>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 text-center text-xs leading-5 text-zinc-500">
          <p>
            Sample files only. Changes are temporary. Paid plans are not
            available yet.
          </p>
          <Link
            href="/pricing"
            className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-teal-700"
          >
            See planned pricing
          </Link>
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
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="border-t border-zinc-200 pt-6"
              >
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-950 px-4 py-24 text-white sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
              Ready to inspect the workflow?
            </p>
            <h2
              className={`${instrumentSerif.className} mt-4 max-w-3xl text-[28px] sm:text-[40px] font-normal leading-[1.08] tracking-normal`}
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
        className={`${instrumentSerif.className} mt-4 text-[32px] sm:text-[40px] font-normal leading-[1.1] tracking-normal text-zinc-900`}
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
    <div className={`grid gap-8 ${className || ""}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.title} className="border-t border-zinc-200 pt-6">
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
