import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const sharp = require(
  require.resolve("sharp", {
    paths: [path.dirname(require.resolve("next/package.json"))],
  }),
);
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "public/product");
const base = process.env.BASE_URL || "http://localhost:3000";

assert(
  new URL(base).hostname === "localhost" ||
    new URL(base).hostname === "127.0.0.1",
  "Capture against a local sample workspace, not a customer deployment.",
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});

async function capture(page, name, clip) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.images]
      .filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;
      })
      .every((img) => img.complete && img.naturalWidth > 0),
  );
  const buffer = await page.screenshot({
    animations: "disabled",
    ...(clip ? { clip } : {}),
  });
  const { channels } = await sharp(buffer).resize(64, 64).stats();
  assert(
    channels.some((channel) => channel.stdev > 12),
    `${name} is blank`,
  );
  await sharp(buffer)
    .webp({ quality: 88 })
    .toFile(path.join(output, `${name}.webp`));
  console.log(`Captured ${name}`);
}

try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}/sign-in`);
    await page
      .getByLabel("Email", { exact: true })
      .fill("hello@evergreen.example");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForURL(/\/dashboard/);
    await page.goto(`${base}/dashboard/projects/project_harper_album`);
    await page
      .locator('input[name="spreads"]')
      .setInputFiles([
        path.join(root, "assets/demo/maya-liam/opening.png"),
        path.join(root, "assets/demo/maya-liam/ceremony.png"),
      ]);
    const heading = page.getByText(
      device === "mobile" ? "Upload album design files" : "Album design files",
      { exact: true },
    );
    await heading.scrollIntoViewIfNeeded();
    await heading.evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100),
    );
    await page.getByText("Ready to upload", { exact: true }).waitFor();
    await capture(page, `workflow-upload-${device}`);

    await page.goto(`${base}/proof/demo-proof-token`);
    await page.getByRole("button", { name: "View spread 2: Ceremony" }).click();
    await page.getByRole("button", { name: /Comment 1: Can we swap/ }).click();
    if (device === "mobile") {
      const workspace = page.locator("[data-proof-workspace]");
      await workspace.evaluate((el) =>
        window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 20),
      );
    } else {
      await page.setViewportSize({ width: 1440, height: 1040 });
    }
    await capture(
      page,
      `workflow-feedback-${device}`,
      device === "desktop"
        ? { x: 0, y: 40, width: 1440, height: 1000 }
        : undefined,
    );
    if (device === "desktop") await page.setViewportSize(viewport);

    await page
      .getByRole("button", { name: "Approve album", exact: true })
      .click();
    await page.getByRole("dialog").waitFor();
    await page
      .getByRole("checkbox", { name: /I approve version 1 for production/ })
      .check();
    await capture(page, `workflow-approval-${device}`);
    assert.deepEqual(errors, [], `${device} browser errors`);
    await context.close();
  }
} finally {
  await browser.close();
}
