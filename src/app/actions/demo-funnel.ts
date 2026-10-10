"use server";

import { recordDemoFunnel } from "@/server/demo-funnel";
import { DEMO_SHARE_TOKEN } from "@/server/store";

export async function recordDemoProofVisitAction() {
  await recordDemoFunnel("viewed", DEMO_SHARE_TOKEN);
}
