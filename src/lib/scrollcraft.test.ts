import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("reviewed Scrollcraft engine", () => {
  it.each([
    [
      "scrollcraft.js",
      "4a419b3ede51f64790af7b56c0195ea01c98a84df8e0e768ebf343956b922f39",
    ],
    [
      "scrollcraft.css",
      "e19eb3aa73b0944626ca56e6e427c76f44753481e04d60f4bac20e8cf1d7758a",
    ],
  ])(
    "keeps %s byte-for-byte identical to upstream 75d81f7",
    (filename, sha) => {
      const bytes = readFileSync(
        new URL(`../../public/vendor/scrollcraft/${filename}`, import.meta.url),
      );
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(sha);
    },
  );

  it("ships the upstream MIT notice", () => {
    const license = readFileSync(
      new URL("../../public/vendor/scrollcraft/LICENSE", import.meta.url),
      "utf8",
    );
    expect(license).toContain("MIT License");
    expect(license).toContain("Copyright (c) 2026 Nate Herk");
  });
});
