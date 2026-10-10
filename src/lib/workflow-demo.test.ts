import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import demo from "@/lib/workflow-demo-assets.json";

describe("workflow recording assets", () => {
  it.each(Object.entries(demo))(
    "ships a playable, captioned %s recording with ordered chapters",
    (_, asset) => {
      expect(asset.chapters.map((chapter) => chapter.id)).toEqual([
        "upload",
        "feedback",
        "approval",
      ]);
      expect(asset.chapters[0].start).toBe(0);
      expect(asset.chapters[1].start).toBeGreaterThan(0);
      expect(asset.chapters[2].start).toBeGreaterThan(asset.chapters[1].start);
      expect(asset.duration).toBeGreaterThan(asset.chapters[2].start);
      expect(asset.duration).toBeLessThan(60);
      const video = readFileSync(
        new URL(`../../public${asset.src}`, import.meta.url),
      );
      expect(video.subarray(4, 8).toString()).toBe("ftyp");
      expect(video.byteLength).toBeLessThan(3 * 1024 * 1024);
      const poster = readFileSync(
        new URL(`../../public${asset.poster}`, import.meta.url),
      );
      expect(poster.subarray(8, 12).toString()).toBe("WEBP");
      const captions = readFileSync(
        new URL(`../../public${asset.captions}`, import.meta.url),
        "utf8",
      );
      expect(captions.startsWith("WEBVTT")).toBe(true);
      expect(captions.match(/ --> /g)).toHaveLength(3);
    },
  );
});
