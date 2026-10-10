import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_LIMITS } from "@/server/billing";

export function PricingPlans() {
  return (
    <div
      aria-label="Planned studio plans"
      className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
    >
      {Object.entries(PLAN_LIMITS).map(([plan, config]) => {
        const [amount, interval] = config.price.split("/");
        return (
          <Card
            key={plan}
            className={
              plan === "starter"
                ? "gap-0 rounded-lg border-teal-700/35 py-7 shadow-[0_4px_24px_rgba(24,24,27,0.04)]"
                : "gap-0 rounded-lg border-zinc-200 py-7 shadow-none"
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
              <p className="flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold leading-tight tracking-normal text-zinc-950">
                  {amount}
                </span>
                <span className="text-sm text-zinc-500">
                  {interval ? "/ month" : "free plan"}
                </span>
              </p>
            </CardHeader>
            <CardContent className="mt-7 flex flex-1 flex-col px-6">
              <ul className="mb-8 flex-1 space-y-4 text-sm text-zinc-600">
                {[
                  config.activeProjects === "unlimited"
                    ? "Unlimited active albums"
                    : `${config.activeProjects} active ${config.activeProjects === 1 ? "album" : "albums"}`,
                  config.storageGb === "unlimited"
                    ? "Unlimited private storage"
                    : `${config.storageGb} GB private storage`,
                  config.revisionHistory ? "Revision history" : "Basic review",
                  config.customBranding
                    ? "Custom branding"
                    : "Album Approve branding",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
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
                variant={plan === "starter" ? "default" : "outline"}
                className={
                  plan === "starter"
                    ? "mt-auto h-10 w-full gap-2 bg-teal-700 shadow-none hover:bg-teal-800"
                    : "mt-auto h-10 w-full gap-2 border-zinc-300 bg-white shadow-none"
                }
              >
                <Link
                  href="/sign-up"
                  aria-label={`${config.label}: try studio preview`}
                >
                  Try studio preview{" "}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
