import { beforeEach, describe, expect, it, vi } from "vitest";
import { replaceSpreadAction } from "@/app/actions/dashboard";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  replaceSpread: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((url: string) => { throw new Error("redirect:" + url); }),
}));
vi.mock("@/server/auth", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/server/store", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/server/store")>(),
  replaceSpread: mocks.replaceSpread,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentUser.mockResolvedValue({ id: "user_demo" });
  mocks.replaceSpread.mockResolvedValue({});
});

function replacementForm() {
  const form = new FormData();
  form.set("projectId", "project_harper_album");
  form.set("albumVersionId", "version_harper_v1");
  form.set("spreadId", "spread_cover");
  form.set("replacement", new File(["fixture"], "replacement.png", { type: "image/png" }));
  return form;
}

describe("replaceSpreadAction", () => {
  it("saves before invalidating and navigating back to the updated spread", async () => {
    await expect(replaceSpreadAction(replacementForm())).rejects.toThrow(
      "redirect:/dashboard/projects/project_harper_album?updatedSpread=spread_cover#spread-spread_cover",
    );
    expect(mocks.replaceSpread).toHaveBeenCalledWith("user_demo", expect.objectContaining({
      projectId: "project_harper_album", spreadId: "spread_cover",
    }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/projects/project_harper_album");
    expect(mocks.replaceSpread.mock.invocationCallOrder[0]).toBeLessThan(mocks.revalidatePath.mock.invocationCallOrder[0]);
    expect(mocks.revalidatePath.mock.invocationCallOrder[0]).toBeLessThan(mocks.redirect.mock.invocationCallOrder[0]);
  });

  it("does not save a replacement without a signed-in user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    await expect(replaceSpreadAction(replacementForm())).rejects.toThrow("redirect:/sign-in");
    expect(mocks.replaceSpread).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("does not report success when storage fails", async () => {
    mocks.replaceSpread.mockRejectedValue(new Error("Storage unavailable"));
    await expect(replaceSpreadAction(replacementForm())).rejects.toThrow("Storage unavailable");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
