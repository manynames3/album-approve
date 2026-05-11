import Stripe from "stripe";
import type { SubscriptionPlan } from "@/server/types";

export const PLAN_LIMITS: Record<
  SubscriptionPlan,
  {
    label: string;
    price: string;
    activeProjects: number | "unlimited";
    storageGb: number | "unlimited";
    revisionHistory: boolean;
    customBranding: boolean;
  }
> = {
  free: {
    label: "Free",
    price: "$0",
    activeProjects: 1,
    storageGb: 1,
    revisionHistory: false,
    customBranding: false,
  },
  starter: {
    label: "Starter",
    price: "$12/mo",
    activeProjects: 10,
    storageGb: 20,
    revisionHistory: true,
    customBranding: true,
  },
  pro: {
    label: "Pro",
    price: "$29/mo",
    activeProjects: "unlimited",
    storageGb: 100,
    revisionHistory: true,
    customBranding: true,
  },
  studio: {
    label: "Studio",
    price: "$79/mo",
    activeProjects: "unlimited",
    storageGb: "unlimited",
    revisionHistory: true,
    customBranding: true,
  },
};

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

function priceEnvForPlan(plan: SubscriptionPlan) {
  return {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    studio: process.env.STRIPE_STUDIO_PRICE_ID,
    free: undefined,
  }[plan];
}

export async function createCheckoutSession(input: {
  plan: SubscriptionPlan;
  studioId: string;
  customerEmail: string;
  baseUrl: string;
}) {
  const stripe = getStripeClient();
  const priceId = priceEnvForPlan(input.plan);

  if (!stripe || !priceId || input.plan === "free") {
    return {
      mode: "stub" as const,
      url: `${input.baseUrl}/dashboard/billing?checkout=stub&plan=${input.plan}`,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.customerEmail,
    client_reference_id: input.studioId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${input.baseUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${input.baseUrl}/dashboard/billing?checkout=cancelled`,
    metadata: {
      studioId: input.studioId,
      plan: input.plan,
    },
  });

  return { mode: "stripe" as const, url: session.url || input.baseUrl };
}
