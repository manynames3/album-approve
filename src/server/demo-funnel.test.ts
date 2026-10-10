import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { recordDemoFunnel } from "@/server/demo-funnel";
import { DEMO_SHARE_TOKEN } from "@/server/store";

const mocks = vi.hoisted(() => ({
  cookie: "",
  headers: new Headers(),
  set: vi.fn(),
}));
vi.mock("next/headers", () => ({
  headers: async () => mocks.headers,
  cookies: async () => ({
    get: () => (mocks.cookie ? { value: mocks.cookie } : undefined),
    set: (...args: unknown[]) => {
      mocks.set(...args);
      mocks.cookie = args[1] as string;
    },
  }),
}));

beforeEach(() => {
  mocks.cookie = "";
  mocks.headers = new Headers();
  mocks.set.mockReset();
  vi.spyOn(console, "info").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("public demo funnel", () => {
  it("records a visit and only the first saved comment, without reviewer data", async () => {
    await recordDemoFunnel("viewed", DEMO_SHARE_TOKEN);
    await recordDemoFunnel("viewed", DEMO_SHARE_TOKEN);
    await recordDemoFunnel("commented", DEMO_SHARE_TOKEN);
    await recordDemoFunnel("commented", DEMO_SHARE_TOKEN);
    const events = vi
      .mocked(console.info)
      .mock.calls.map(([payload]) => JSON.parse(payload));
    expect(events.map((event) => event.event)).toEqual([
      "demo_proof_viewed",
      "demo_first_comment_saved",
    ]);
    expect(events[0].sessionId).toBe(events[1].sessionId);
    expect(Object.keys(events[0]).sort()).toEqual([
      "event",
      "sessionId",
      "timestamp",
      "type",
    ]);
    expect(mocks.set).toHaveBeenCalledWith(
      "album_approve_demo_funnel",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/proof/demo-proof-token",
      }),
    );
    expect(mocks.set.mock.calls[0][2]).not.toHaveProperty("maxAge");
  });

  it("ignores private proofs and comments without a measured visit", async () => {
    await recordDemoFunnel("viewed", "private-client-token");
    await recordDemoFunnel("commented", DEMO_SHARE_TOKEN);
    expect(console.info).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it.each(["dnt", "sec-gpc"])("honors the %s opt-out", async (header) => {
    mocks.headers.set(header, "1");
    await recordDemoFunnel("viewed", DEMO_SHARE_TOKEN);
    expect(console.info).not.toHaveBeenCalled();
    expect(mocks.set).not.toHaveBeenCalled();
  });

  it("rejects a tampered cookie instead of crediting a conversion", async () => {
    await recordDemoFunnel("viewed", DEMO_SHARE_TOKEN);
    mocks.cookie = mocks.cookie.replace(/.$/, "x");
    vi.mocked(console.info).mockClear();
    await recordDemoFunnel("commented", DEMO_SHARE_TOKEN);
    expect(console.info).not.toHaveBeenCalled();
  });

  it("does not throw if cookie persistence fails", async () => {
    mocks.set.mockImplementation(() => {
      throw new Error("Cookies unavailable");
    });
    await expect(
      recordDemoFunnel("viewed", DEMO_SHARE_TOKEN),
    ).resolves.toBeUndefined();
    expect(console.info).not.toHaveBeenCalled();
  });
});
