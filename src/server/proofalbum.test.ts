import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import {
  DEMO_SHARE_TOKEN,
  DEMO_USER_ID,
  addCommentByToken,
  exportProjectCommentsCsv,
  getProofByToken,
  readData,
  resetDemoData,
  submitDecisionByToken,
} from "@/server/store";
import { signedAssetUrl, verifyAssetSignature } from "@/server/storage";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "proofalbum-"));
  process.env.PROOFALBUM_DATA_DIR = tempDir;
  process.env.PROOFALBUM_DATA_FILE = path.join(tempDir, "proofalbum-demo.json");
  process.env.PROOFALBUM_SECRET = "test-secret";
  await resetDemoData();
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
  delete process.env.PROOFALBUM_DATA_DIR;
  delete process.env.PROOFALBUM_DATA_FILE;
});

describe("ProofAlbum demo store", () => {
  it("scopes proof access by hashed token", async () => {
    await expect(getProofByToken("wrong-token")).resolves.toBeNull();

    const proof = await getProofByToken(DEMO_SHARE_TOKEN);

    expect(proof?.project.id).toBe("project_harper_album");
    expect(proof?.spreads).toHaveLength(4);
  });

  it("rejects comments for spreads outside the proof link", async () => {
    await expect(
      addCommentByToken({
        token: DEMO_SHARE_TOKEN,
        spreadId: "spread_that_is_not_in_this_version",
        authorName: "Maya Harper",
        authorEmail: "maya@example.com",
        body: "Try to attach to a foreign spread.",
      }),
    ).rejects.toThrow("Spread is not part of this proofing link.");
  });

  it("records comments and approval decisions on the album version", async () => {
    const comment = await addCommentByToken({
      token: DEMO_SHARE_TOKEN,
      spreadId: "spread_cover",
      authorName: "Maya Harper",
      authorEmail: "maya@example.com",
      body: "Cover is ready.",
    });
    const approval = await submitDecisionByToken({
      token: DEMO_SHARE_TOKEN,
      clientName: "Maya Harper",
      clientEmail: "maya@example.com",
      decision: "approved",
    });
    const data = await readData();
    const version = data.albumVersions.find(
      (item) => item.id === "version_harper_v1",
    );

    expect(comment.id).toMatch(/^comment_/);
    expect(approval.decision).toBe("approved");
    expect(version?.status).toBe("approved");
    expect(version?.approvedAt).toBeDefined();
  });

  it("exports project comments as CSV for authorized studio users", async () => {
    const csv = await exportProjectCommentsCsv(
      DEMO_USER_ID,
      "project_harper_album",
    );

    expect(csv).toContain('"version","spread","author_name"');
    expect(csv).toContain("02-ceremony.svg");
  });

  it("requires valid signed asset URLs", () => {
    const url = new URL(
      signedAssetUrl("demo/harper/cover.svg"),
      "http://localhost",
    );

    expect(
      verifyAssetSignature(
        "demo/harper/cover.svg",
        url.searchParams.get("expires"),
        url.searchParams.get("signature"),
      ),
    ).toBe(true);
    expect(
      verifyAssetSignature(
        "demo/harper/ceremony.svg",
        url.searchParams.get("expires"),
        url.searchParams.get("signature"),
      ),
    ).toBe(false);
  });
});
