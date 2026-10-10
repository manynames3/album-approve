import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Instrument_Serif } from "next/font/google";
import { BrandWordmark } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_LIMITS } from "@/server/billing";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400" });

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <BrandWordmark className="text-[0.68rem] tracking-[0.2em]" />
          </Link>
        </Button>
        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-xs font-medium text-teal-700">Planned pricing</p>
          <h1
            className={`${instrumentSerif.className} mt-4 text-[36px] font-normal leading-[1.1] sm:text-[48px]`}
          >
            Simple plans for album proofing.
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-500">
            Try the preview free. Prices and limits below are planned, not live
            offers.
          </p>
        </div>
        <section
          aria-label="Proposed studio plans"
          className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {Object.entries(PLAN_LIMITS).map(([plan, config]) => {
            const [amount, interval] = config.price.split("/");
            const storageLabel =
              config.storageGb === "unlimited"
                ? "Unlimited private storage"
                : `${config.storageGb} GB private storage`;

            return (
              <Card
                key={plan}
                className={
                  plan === "starter"
                    ? "gap-0 border-teal-700/35 py-7 shadow-[0_4px_24px_rgba(24,24,27,0.04)]"
                    : "gap-0 border-zinc-200 py-7"
                }
              >
                <CardHeader className="gap-5 px-6">
                  <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base tracking-normal">
                      {config.label}
                    </CardTitle>
                    {plan === "starter" ? (
                      <Badge
                        variant="outline"
                        className="rounded-md border-teal-200 bg-teal-50 text-[11px] text-teal-800"
                      >
                        Regular proofs
                      </Badge>
                    ) : null}
                  </div>
                  <CardDescription className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold leading-tight tracking-normal text-zinc-950">
                      {amount}
                    </span>
                    {interval ? (
                      <span className="text-sm text-zinc-500">/ month</span>
                    ) : (
                      <span className="text-sm text-zinc-500">free plan</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-7 flex flex-1 flex-col px-6">
                  <ul className="mb-8 flex-1 space-y-4 text-sm text-zinc-600">
                    <PlanFeature
                      label={
                        config.activeProjects === "unlimited"
                          ? "Unlimited active albums"
                          : `${config.activeProjects} active ${config.activeProjects === 1 ? "album" : "albums"}`
                      }
                    />
                    <PlanFeature label={storageLabel} />
                    <PlanFeature
                      label={
                        config.revisionHistory
                          ? "Revision history"
                          : "Basic review"
                      }
                    />
                    <PlanFeature
                      label={
                        config.customBranding
                          ? "Custom branding"
                          : "Album Approve branding"
                      }
                    />
                  </ul>
                  <Button
                    asChild
                    className={
                      plan === "starter"
                        ? "mt-auto h-10 w-full gap-2 bg-teal-700 shadow-none hover:bg-teal-800"
                        : "mt-auto h-10 w-full gap-2 border-zinc-300 bg-white shadow-none"
                    }
                    variant={plan === "starter" ? "default" : "outline"}
                  >
                    <Link
                      href="/sign-up"
                      aria-label={`${config.label}: try studio preview`}
                    >
                      Try studio preview
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
        <div className="mx-auto mt-8 max-w-xl text-center text-sm leading-6 text-zinc-500">
          <p>Sample files only. Changes are temporary. No payment required.</p>
          <Link
            href="/proof/demo-proof-token"
            className="mt-4 inline-flex items-center gap-2 font-medium text-teal-700 hover:text-teal-800"
          >
            Open sample proof <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  );
}

function PlanFeature({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2
        className="mt-0.5 size-4 shrink-0 text-teal-700"
        aria-hidden="true"
      />
      <span>{label}</span>
    </li>
  );
}
