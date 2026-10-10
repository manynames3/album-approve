import { cookies, headers } from "next/headers";
import { createId, hmacDigest, isSafeEqual, nowIso } from "@/server/security";
import { DEMO_SHARE_TOKEN } from "@/server/store";

const COOKIE = "album_approve_demo_funnel";

export async function recordDemoFunnel(
  event: "viewed" | "commented",
  token: string,
) {
  if (token !== DEMO_SHARE_TOKEN) return;

  // Measurement must never prevent a client from saving feedback.
  try {
    const requestHeaders = await headers();
    if (
      requestHeaders.get("dnt") === "1" ||
      requestHeaders.get("sec-gpc") === "1"
    )
      return;
    const jar = await cookies();
    const value = jar.get(COOKIE)?.value || "";
    const [id, stage, signature] = value.split(".");
    const valid =
      /^demo_[a-f0-9]{18}$/.test(id || "") &&
      (stage === "viewed" || stage === "commented") &&
      isSafeEqual(signature || "", hmacDigest(`demo-funnel:${id}:${stage}`));

    if (event === "viewed" && valid) return;
    if (event === "commented" && (!valid || stage !== "viewed")) return;
    const sessionId = valid ? id : createId("demo");
    jar.set(
      COOKIE,
      `${sessionId}.${event}.${hmacDigest(`demo-funnel:${sessionId}:${event}`)}`,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: `/proof/${DEMO_SHARE_TOKEN}`,
      },
    );
    console.info(
      JSON.stringify({
        type: "demo_funnel",
        event:
          event === "viewed" ? "demo_proof_viewed" : "demo_first_comment_saved",
        sessionId,
        timestamp: nowIso(),
      }),
    );
  } catch {
    // Cookie or logging failures are intentionally non-blocking.
  }
}
