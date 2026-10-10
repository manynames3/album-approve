import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
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
const base = process.env.BASE_URL || "http://localhost:3000";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Only record against a local sample workspace.",
);
const output = path.join(root, "public/product");
const scratch =
  process.env.RECORDING_DIR || "/tmp/album-approve-workflow-recording";
await mkdir(output, { recursive: true });
await mkdir(scratch, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});
const manifest = {};

function ffmpeg(args) {
  const result = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
}

async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.images]
      .filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;
      })
      .every((img) => img.complete && img.naturalWidth > 0),
  );
}

async function position(page, locator, top = 80) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate(
    (el, offset) =>
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY - offset,
        behavior: "smooth",
      }),
    top,
  );
  await page.waitForTimeout(650);
}

async function click(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  assert(box, "Click target is not visible");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 20,
  });
  await page.waitForTimeout(300);
  await locator.click();
}

try {
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const setup = await browser.newContext({ viewport });
    const studio = await setup.newPage();
    await studio.goto(`${base}/sign-in`);
    await studio
      .getByLabel("Email", { exact: true })
      .fill("demo@proofalbum.test");
    await studio.getByRole("button", { name: "Continue", exact: true }).click();
    await studio.waitForURL(/\/dashboard/);
    await studio
      .getByLabel("Project title", { exact: true })
      .fill("Maya & Liam's Wedding Album");
    await studio.getByLabel("Client name", { exact: true }).fill("Maya Harper");
    await studio
      .getByLabel("Client email", { exact: true })
      .fill("maya.harper@example.com");
    await studio
      .getByLabel("Client phone", { exact: true })
      .fill("+1 202 555 0143");
    await studio
      .getByRole("button", { name: "Create album", exact: true })
      .click();
    await studio.waitForURL(/\/dashboard\/projects\//);
    const projectUrl = studio.url();
    const recording = await browser.newContext({
      viewport,
      storageState: await setup.storageState(),
      recordVideo: { dir: scratch, size: viewport },
    });
    // The marker follows real mouse events; it is only injected into the recording browser.
    await recording.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const marker = document.createElement("div");
        Object.assign(marker.style, {
          position: "fixed",
          width: "18px",
          height: "18px",
          border: "2px solid white",
          borderRadius: "50%",
          background: "#0f766e",
          boxShadow: "0 0 0 1px #0f766e",
          zIndex: "2147483647",
          pointerEvents: "none",
          opacity: "0",
          transform: "translate(-50%, -50%)",
        });
        document.body.append(marker);
        document.addEventListener("mousemove", (event) => {
          marker.style.left = `${event.clientX}px`;
          marker.style.top = `${event.clientY}px`;
          marker.style.opacity = "1";
        });
        document.addEventListener("mousedown", () => {
          marker.style.scale = "1.5";
        });
        document.addEventListener("mouseup", () => {
          marker.style.scale = "1";
        });
      });
    });
    const page = await recording.newPage();
    const origin = performance.now();
    const clock = () => (performance.now() - origin) / 1000;
    const clips = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(projectUrl);
    await position(
      page,
      page.getByText(
        device === "mobile"
          ? "Upload album design files"
          : "Album design files",
        { exact: true },
      ),
    );
    await ready(page);
    let start = clock();
    await page.waitForTimeout(1200);
    await page
      .locator('input[name="spreads"]')
      .setInputFiles(
        ["opening", "ceremony", "portraits", "reception"].map((name) =>
          path.join(root, `assets/demo/maya-liam/${name}.png`),
        ),
      );
    await page.waitForTimeout(1500);
    await click(
      page,
      page.getByRole("button", { name: "Upload design files", exact: true }),
    );
    await page.getByText("4 uploaded", { exact: true }).waitFor();
    await position(
      page,
      page.getByText("Album design files", { exact: true }),
      80,
    );
    await ready(page);
    await page.waitForTimeout(2200);
    clips.push({ id: "upload", start, duration: clock() - start });

    await page
      .getByRole("button", { name: "Create proof link", exact: true })
      .click();
    await page.waitForURL((url) => url.searchParams.has("shareToken"));
    const token = new URL(page.url()).searchParams.get("shareToken");
    assert(token, "The studio did not create a proof link");
    const proofUrl = `${base}/proof/${encodeURIComponent(token)}`;
    await page.goto(proofUrl);
    await page.getByRole("button", { name: /^View spread 2(?:\b|:)/ }).click();
    await position(
      page,
      page.locator("[data-proof-workspace]"),
      device === "mobile" ? 20 : 100,
    );
    await ready(page);
    start = clock();
    await page.waitForTimeout(1200);
    const box = await page.locator("[data-spread-canvas] img").boundingBox();
    assert(box);
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.38, {
      steps: 25,
    });
    await page.waitForTimeout(500);
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.38);
    await page
      .getByLabel("Pinned comment", { exact: true })
      .pressSequentially("Please use the wider aisle photo here.", {
        delay: 65,
      });
    await page.waitForTimeout(600);
    await click(
      page,
      page.getByRole("button", { name: "Save comment", exact: true }),
    );
    await page.waitForURL(/#spread-/);
    const note = page.getByText("Please use the wider aisle photo here.", {
      exact: true,
    });
    await note.waitFor();
    if (device === "mobile") await position(page, note, 570);
    await ready(page);
    await page.waitForTimeout(2300);
    clips.push({ id: "feedback", start, duration: clock() - start });

    // Resolve the actual saved note in the studio before recording the final decision.
    await studio.goto(projectUrl);
    await studio.getByRole("button", { name: "Resolve", exact: true }).click();
    await studio
      .getByRole("button", { name: "Resolve", exact: true })
      .waitFor({ state: "hidden" });
    await page.goto(proofUrl);
    await page.getByRole("button", { name: /^View spread 2(?:\b|:)/ }).click();
    await ready(page);
    await position(
      page,
      page.getByRole("button", { name: "Approve album", exact: true }),
      device === "mobile" ? 500 : 520,
    );
    start = clock();
    await page.waitForTimeout(1200);
    await click(
      page,
      page.getByRole("button", { name: "Approve album", exact: true }),
    );
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await page.waitForTimeout(1700);
    await click(
      page,
      dialog.getByRole("checkbox", {
        name: /I approve version 1 for production/,
      }),
    );
    await page.waitForTimeout(1000);
    await click(
      page,
      dialog.getByRole("button", { name: "Confirm approval", exact: true }),
    );
    await page.waitForURL(/submitted=approved/);
    await page
      .getByRole("status")
      .filter({ hasText: /approval/i })
      .waitFor();
    await position(
      page,
      page.getByRole("status").filter({ hasText: /approval/i }),
      110,
    );
    await page.waitForTimeout(2500);
    clips.push({ id: "approval", start, duration: clock() - start });
    const video = page.video();
    await recording.close();
    const raw = await video.path();
    assert.deepEqual(errors, [], `${device} recording has browser errors`);
    const filters = clips.map(
      (clip, i) =>
        `[0:v]trim=start=${clip.start.toFixed(3)}:duration=${clip.duration.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`,
    );
    filters.push("[v0][v1][v2]concat=n=3:v=1:a=0[out]");
    const filename = `workflow-demo-${device}.mp4`;
    ffmpeg([
      "-i",
      raw,
      "-filter_complex",
      filters.join(";"),
      "-map",
      "[out]",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "24",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "25",
      "-movflags",
      "+faststart",
      path.join(output, filename),
    ]);
    const poster = spawnSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        "1.5",
        "-i",
        path.join(output, filename),
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-vcodec",
        "png",
        "pipe:1",
      ],
      { maxBuffer: 10 * 1024 * 1024 },
    );
    assert.equal(poster.status, 0, poster.stderr.toString());
    await sharp(poster.stdout)
      .webp({ quality: 88 })
      .toFile(path.join(output, `workflow-demo-${device}-poster.webp`));
    let offset = 0;
    manifest[device] = {
      src: `/product/${filename}`,
      poster: `/product/workflow-demo-${device}-poster.webp`,
      captions: `/product/workflow-demo-${device}.vtt`,
      width: viewport.width,
      height: viewport.height,
      chapters: clips.map((clip) => {
        const item = { id: clip.id, start: Number(offset.toFixed(2)) };
        offset += clip.duration;
        return item;
      }),
      duration: Number(offset.toFixed(2)),
    };
    const stamp = (seconds) =>
      new Date(seconds * 1000).toISOString().slice(11, 23);
    const captions = [
      "Upload exported spreads and see them in the album.",
      "Pin a note to the ceremony spread and save the comment.",
      "After the studio resolves feedback, confirm approval for version one.",
    ];
    await writeFile(
      path.join(output, `workflow-demo-${device}.vtt`),
      "WEBVTT\n\n" +
        manifest[device].chapters
          .map(
            (chapter, i) =>
              `${stamp(chapter.start)} --> ${stamp(manifest[device].chapters[i + 1]?.start || offset)}\n${captions[i]}\n`,
          )
          .join("\n"),
    );
    assert(
      offset > 15 && offset < 60,
      `Unexpected ${device} demo duration: ${offset}`,
    );
    console.log(
      `${device}: recorded actual upload, saved comment, resolved note and approval (${offset.toFixed(1)}s)`,
    );
    await setup.close();
  }
  await writeFile(
    path.join(root, "src/lib/workflow-demo-assets.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
