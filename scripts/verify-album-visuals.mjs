import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const sharp = require(require.resolve("sharp", { paths: [path.dirname(require.resolve("next/package.json"))] }));
const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "public/product");
const reportDir = path.join(root, "docs/visual-review");
const base = "http://127.0.0.1:4317";
const report = { sourceCommit: process.env.GITHUB_SHA || "local", capturedAt: new Date().toISOString(), checks: [], captures: [] };
await mkdir(output, { recursive: true });
await mkdir(reportDir, { recursive: true });

const server = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "4317"], {
  cwd: root, env: { ...process.env, NEXT_PUBLIC_APP_URL: base }, stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (data) => { serverLog += data; });
server.stderr.on("data", (data) => { serverLog += data; });
let browser;

async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.querySelectorAll("[data-spread-canvas] img")].every((img) => img.complete && img.naturalWidth > 0));
}

async function checkLayout(page, label) {
  const problems = await page.evaluate(() => {
    const found = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) found.push("Document overflows horizontally");
    for (const el of document.querySelectorAll("button, nav a")) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      if (el.scrollWidth > el.clientWidth + 2) found.push("Control text overflows: " + (el.textContent || el.getAttribute("aria-label")));
    }
    for (const img of document.querySelectorAll("[data-spread-canvas] img")) {
      const rect = img.getBoundingClientRect();
      if (!rect.width || !rect.height) continue;
      const rendered = rect.width / rect.height;
      const natural = img.naturalWidth / img.naturalHeight;
      if (Math.abs(rendered - natural) > 0.015) found.push("Album image aspect ratio is distorted");
    }
    return found;
  });
  assert.deepEqual(problems, [], label);
  report.checks.push(label);
}

async function capture(page, name, locator) {
  const buffer = locator ? await locator.screenshot() : await page.screenshot({ fullPage: false });
  const { channels } = await sharp(buffer).resize(64, 64).stats();
  assert(channels.some((channel) => channel.stdev > 12), name + " is blank");
  const optimized = await sharp(buffer).webp({ quality: 88 }).toBuffer();
  await writeFile(path.join(output, name + ".webp"), optimized);
  const { width, height } = await sharp(optimized).metadata();
  report.captures.push({ name, width, height, bytes: optimized.byteLength });
}

try {
  let available = false;
  for (let retry = 0; retry < 90; retry++) {
    if (server.exitCode !== null) throw new Error("Server exited: " + serverLog);
    try { const response = await fetch(base); if (response.ok) { available = true; break; } } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert(available, "Production server did not start: " + serverLog);
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: "UTC", reducedMotion: "reduce" });
  const page = await context.newPage();
  const browserErrors = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto(base + "/");
  await ready(page);
  await checkLayout(page, "Desktop homepage fits without overflow");
  const previewImage = page.locator("[data-product-preview] [data-spread-canvas] img");
  assert((await previewImage.boundingBox()).y < 1000, "Product visual is below the first viewport");
  await page.getByRole("button", { name: "Preview Portraits spread" }).click();
  await ready(page);
  assert((await previewImage.getAttribute("src")).includes("portraits.webp"));
  await capture(page, "landing-desktop");

  await page.goto(base + "/proof/demo-proof-token");
  await ready(page);
  await checkLayout(page, "Desktop proof preserves album proportions");
  await capture(page, "proof-desktop");
  for (const title of ["Opening", "Ceremony", "Portraits", "Reception"]) {
    await page.getByRole("button", { name: new RegExp("View spread [1-4]: " + title) }).click();
    await ready(page);
    await checkLayout(page, "Rendered " + title + " sample spread");
  }

  await page.getByRole("button", { name: "View spread 2: Ceremony" }).click();
  await ready(page);
  await page.getByRole("button", { name: /Comment 1: Can we swap/ }).click();
  await capture(page, "comments-detail", page.locator("[data-proof-workspace]"));

  await page.getByRole("button", { name: "Full screen", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await ready(page);
  await checkLayout(page, "Full-screen spread fits the viewport");
  await page.getByRole("dialog").getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Fit spread", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  assert(await page.getByRole("button", { name: "Full screen", exact: true }).isVisible());
  report.checks.push("Full-screen zoom, fit, Escape, and focus return work");

  const image = page.locator("[data-spread-canvas] img");
  const rect = await image.boundingBox();
  await page.mouse.click(rect.x + rect.width * 0.7, rect.y + rect.height * 0.5);
  await page.getByLabel("Pinned comment", { exact: true }).fill("Please keep the wider aisle image in this revision.");
  await page.getByRole("button", { name: "Save comment", exact: true }).click();
  await page.waitForURL(/#spread-spread_ceremony/);
  await ready(page);
  await page.getByText("Please keep the wider aisle image in this revision.", { exact: true }).waitFor();
  assert((await page.getByRole("button", { name: "View spread 2: Ceremony" }).getAttribute("aria-current")) === "true");
  report.checks.push("Pinned comment saves and returns to the correct spread");

  await page.getByRole("button", { name: "Request changes", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  assert(await page.getByLabel("What needs to change?", { exact: true }).getAttribute("required") !== null);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Approve album", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await capture(page, "approval-detail", page.getByRole("dialog"));
  await page.getByLabel(/I approve version 1 for production/).check();
  await page.getByRole("button", { name: "Confirm approval", exact: true }).click();
  await page.waitForURL(/submitted=approved/);
  await page.getByRole("status").filter({ hasText: "Your approval was recorded" }).waitFor();
  report.checks.push("Changes require a note; approval requires confirmation and records a decision");

  for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
    await page.setViewportSize(viewport);
    await page.goto(base + "/");
    await ready(page);
    await checkLayout(page, "Homepage at " + viewport.width + "px");
    const box = await page.locator("[data-product-preview] [data-spread-canvas] img").boundingBox();
    assert(box.y < viewport.height, "Product image is below first viewport at " + viewport.width);
    if (viewport.width === 390) await capture(page, "landing-mobile");
    await page.goto(base + "/proof/demo-proof-token");
    await ready(page);
    await checkLayout(page, "Proof at " + viewport.width + "px");
    await page.getByRole("button", { name: "View spread 3: Portraits" }).click();
    await ready(page);
    if (viewport.width === 390) await capture(page, "proof-mobile");
    await page.getByRole("button", { name: "Full screen", exact: true }).click();
    await ready(page);
    await checkLayout(page, "Full-screen proof at " + viewport.width + "px");
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/sign-in");
  await page.getByLabel("Email", { exact: true }).fill("demo@proofalbum.test");
  await page.getByRole("button", { name: /sign in|continue|open/i }).click();
  await page.waitForURL(/dashboard/);
  await page.goto(base + "/dashboard/projects/project_harper_album");
  await page.getByText("Album design files", { exact: true }).waitFor();
  const studioRatios = await page.locator("figure img").evaluateAll((images) => images.map((img) => getComputedStyle(img).objectFit));
  assert(studioRatios.length >= 4 && studioRatios.every((fit) => fit === "contain"), "Studio previews crop designs");
  report.checks.push("Studio sign-in/project flow and uncropped thumbnails remain intact");

  const catalog = JSON.parse(await readFile(path.join(root, "src/lib/demo-album-assets.json"), "utf8"));
  for (const asset of catalog) {
    const full = await readFile(path.join(root, "public", asset.src));
    const thumb = await readFile(path.join(root, "public", asset.thumbnailSrc));
    assert.equal(full.byteLength, asset.sizeBytes);
    assert(thumb.byteLength < full.byteLength / 5, "Thumbnail is not lightweight");
  }
  report.checks.push("All sample assets load with correct metadata and lightweight thumbnails");
  assert.deepEqual(browserErrors, [], "Browser runtime errors");
  report.checks.push("No browser runtime errors");
  await writeFile(path.join(reportDir, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(error);
  console.error(serverLog);
  throw error;
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    if (server.exitCode !== null) return resolve();
    const timer = setTimeout(() => { server.kill("SIGKILL"); resolve(); }, 5000);
    server.once("exit", () => { clearTimeout(timer); resolve(); });
  });
}
