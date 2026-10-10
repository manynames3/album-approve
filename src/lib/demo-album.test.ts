import { describe, expect, it } from "vitest";
import { DEMO_ALBUM_ASSETS, getDemoAlbumAsset, upgradeDemoSpread } from "./demo-album";
import type { Spread } from "@/server/types";

const spread: Spread = {
  id: "spread_cover",
  albumVersionId: "version_harper_v1",
  storageKey: "demo/harper/cover.svg",
  filename: "01-cover.svg",
  width: 1400,
  height: 900,
  mimeType: "image/svg+xml",
  sizeBytes: 4200,
  sortOrder: 1,
  createdAt: "2026-05-11T12:00:00.000Z",
};

describe("public fictional sample assets", () => {
  it("upgrades old sample metadata without losing comment and version identities", () => {
    const upgraded = upgradeDemoSpread(spread);
    expect(upgraded.id).toBe(spread.id);
    expect(upgraded.albumVersionId).toBe(spread.albumVersionId);
    expect(upgraded.filename).toBe("01-opening.webp");
    expect(upgraded.width! / upgraded.height!).toBe(2);
    expect(upgraded.mimeType).toBe("image/webp");
  });

  it("does not make an uploaded replacement public based on its spread ID", () => {
    const privateSpread = {
      ...spread,
      storageKey: "studios/private/project/spread_cover.jpg",
    };
    expect(upgradeDemoSpread(privateSpread)).toBe(privateSpread);
    expect(getDemoAlbumAsset(privateSpread.storageKey)).toBeUndefined();
    expect(getDemoAlbumAsset("../demo/maya-liam/opening.webp")).toBeUndefined();
  });

  it("has four correctly sized, independently thumbnailed sample spreads", () => {
    expect(DEMO_ALBUM_ASSETS).toHaveLength(4);
    expect(new Set(DEMO_ALBUM_ASSETS.map((asset) => asset.src)).size).toBe(4);
    for (const asset of DEMO_ALBUM_ASSETS) {
      expect(asset.width / asset.height).toBe(2);
      expect(asset.sizeBytes).toBeGreaterThan(0);
      expect(asset.src).not.toBe(asset.thumbnailSrc);
      expect(getDemoAlbumAsset(asset.storageKey)).toEqual(asset);
      expect(getDemoAlbumAsset(asset.legacyKey)).toEqual(asset);
    }
  });
});
