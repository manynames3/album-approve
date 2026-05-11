import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react";
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

export default function PricingPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            ProofAlbum
          </Link>
        </Button>
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="border-teal-200 bg-teal-50 text-teal-800"
          >
            Billing-ready demo
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Pricing for album approvals
          </h1>
          <p className="mt-3 text-zinc-600">
            Plan constants are shared with the billing integration so usage
            gates and Stripe checkout stay aligned.
          </p>
        </div>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(PLAN_LIMITS).map(([plan, config]) => {
            const storageLabel =
              config.storageGb === "unlimited"
                ? "Unlimited private storage"
                : `${config.storageGb} GB private storage`;

            return (
              <Card
                key={plan}
                className={
                  plan === "starter"
                    ? "border-teal-300 shadow-[0_16px_40px_rgba(15,118,110,0.12)]"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{config.label}</CardTitle>
                    {plan === "starter" ? (
                      <Badge className="bg-teal-700 text-white">Popular</Badge>
                    ) : null}
                  </div>
                  <CardDescription>
                    <span className="text-2xl font-semibold text-zinc-950">
                      {config.price}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-2 text-sm text-zinc-600">
                    <PlanFeature
                      label={`${config.activeProjects} active albums`}
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
                          : "ProofAlbum branding"
                      }
                    />
                  </ul>
                  <Button
                    asChild
                    className="w-full gap-2"
                    variant={plan === "free" ? "outline" : "default"}
                  >
                    <Link href="/sign-in">
                      <CreditCard className="size-4" aria-hidden="true" />
                      Start
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function PlanFeature({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className="size-4 text-teal-700" aria-hidden="true" />
      <span>{label}</span>
    </li>
  );
}
