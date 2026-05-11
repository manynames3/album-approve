import { CreditCard, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_LIMITS } from "@/server/billing";
import { getCurrentUser } from "@/server/auth";
import { getDashboardData } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; plan?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const params = await searchParams;
  const { subscription } = await getDashboardData(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Album Approve is wired for Stripe Billing. Without Stripe env vars,
          checkout uses safe stubs and keeps the app fully explorable.
        </p>
      </div>

      {params.checkout ? (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="flex items-center gap-3 pt-0 text-teal-900">
            <Sparkles className="size-5" aria-hidden="true" />
            <p className="text-sm">
              Checkout result: {params.checkout}
              {params.plan ? ` for ${params.plan}` : ""}.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            Stored in the subscriptions table model.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <StatusBadge status={subscription?.status || "trialing"} />
          <p className="text-sm capitalize text-zinc-700">
            {subscription?.plan || "free"} plan
          </p>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(PLAN_LIMITS).map(([plan, config]) => (
          <Card
            key={plan}
            className={plan === subscription?.plan ? "border-teal-300" : ""}
          >
            <CardHeader>
              <CardTitle>{config.label}</CardTitle>
              <CardDescription>{config.price}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-zinc-600">
                <li>{config.activeProjects} active albums</li>
                <li>{config.storageGb} GB storage</li>
                <li>
                  {config.revisionHistory
                    ? "Revision history"
                    : "Basic comments"}
                </li>
                <li>
                  {config.customBranding
                    ? "Custom branding"
                    : "Album Approve branding"}
                </li>
              </ul>
              <form action="/api/billing/checkout" method="post">
                <input type="hidden" name="plan" value={plan} />
                <Button
                  className="w-full gap-2"
                  variant={plan === "free" ? "outline" : "default"}
                >
                  <CreditCard className="size-4" aria-hidden="true" />
                  {plan === subscription?.plan ? "Current plan" : "Choose plan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
