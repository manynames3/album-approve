import type Stripe from "stripe";
import { getStripeClient } from "@/server/billing";
import { planSchema } from "@/server/schema";
import { setSubscriptionPlanForStudio } from "@/server/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!stripe || !webhookSecret || !signature) {
    return Response.json({ received: true, mode: "stub" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid Stripe signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const plan = planSchema.safeParse(session.metadata?.plan);
    const studioId = session.metadata?.studioId;

    if (plan.success && studioId) {
      await setSubscriptionPlanForStudio({
        studioId,
        plan: plan.data,
        stripeCustomerId:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id,
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id,
      });
    }
  }

  return Response.json({ received: true });
}
