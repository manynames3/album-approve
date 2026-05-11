import { createCheckoutSession } from "@/server/billing";
import { getCurrentUser } from "@/server/auth";
import { planSchema } from "@/server/schema";
import { getDashboardData, setSubscriptionPlan } from "@/server/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.redirect(new URL("/sign-in", request.url));
  }

  const formData = await request.formData();
  const plan = planSchema.parse(formData.get("plan"));
  const { studio } = await getDashboardData(user.id);
  const checkout = await createCheckoutSession({
    plan,
    studioId: studio.id,
    customerEmail: user.email,
    baseUrl: new URL("/", request.url).origin,
  });

  if (checkout.mode === "stub") {
    await setSubscriptionPlan(user.id, plan);
  }

  return Response.redirect(checkout.url);
}
