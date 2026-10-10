import assets from "./demo-album-assets.json";
import type { Spread } from "@/server/types";

export const DEMO_ALBUM_ASSETS = assets;

// Only these fictional, repository-owned samples are public. Uploaded client files
// must keep using the signed private asset route, even if their IDs match the seed.
export function getDemoAlbumAsset(storageKey: string) {
  return assets.find(
    (asset) => asset.storageKey === storageKey || asset.legacyKey === storageKey,
  );
}

export function upgradeDemoSpread(spread: Spread): Spread {
  const asset = getDemoAlbumAsset(spread.storageKey);
  if (!asset) return spread;

  return {
    ...spread,
    storageKey: asset.storageKey,
    thumbnailKey: asset.storageKey,
    filename: asset.filename,
    width: asset.width,
    height: asset.height,
    mimeType: "image/webp",
    sizeBytes: asset.sizeBytes,
  };
}
