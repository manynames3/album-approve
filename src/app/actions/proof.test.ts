import { beforeEach, describe, expect, it, vi } from "vitest";
import { addProofCommentAction } from "@/app/actions/proof";

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  record: vi.fn(),
  access: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/server/demo-funnel", () => ({ recordDemoFunnel: mocks.record }));
vi.mock("@/server/proof-access", () => ({
  hasProofAccess: mocks.access,
  grantProofAccess: vi.fn(),
}));
vi.mock("@/server/store", () => ({
  addCommentByToken: mocks.save,
  getProofByToken: vi.fn(),
  submitDecisionByToken: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.save.mockResolvedValue({});
  mocks.access.mockResolvedValue(false);
});

function comment() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    token: "demo-proof-token",
    spreadId: "spread_ceremony",
    authorName: "Demo Reviewer",
    authorEmail: "reviewer@example.com",
    body: "Please swap this image.",
  }))
    form.set(key, value);
  return form;
}

describe("comment conversion measurement", () => {
  it("measures only after feedback saves and preserves the proof destination", async () => {
    await expect(addProofCommentAction(comment())).rejects.toThrow(
      "redirect:/proof/demo-proof-token?",
    );
    expect(mocks.record).toHaveBeenCalledWith("commented", "demo-proof-token");
    expect(mocks.save.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.record.mock.invocationCallOrder[0],
    );
    expect(mocks.redirect).toHaveBeenCalledWith(
      expect.stringContaining("#spread-spread_ceremony"),
    );
  });

  it("never counts failed saves", async () => {
    mocks.save.mockRejectedValue(new Error("Storage unavailable"));
    await expect(addProofCommentAction(comment())).rejects.toThrow(
      "Storage unavailable",
    );
    expect(mocks.record).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
