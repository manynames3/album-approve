import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.BASE_URL || "http://localhost:3000";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Use a local sample workspace.",
);
const demo = JSON.parse(
  await readFile(
    new URL("../src/lib/workflow-demo-assets.json", import.meta.url),
    "utf8",
  ),
);
const browser = await chromium.launch({
  ...(process.env.BROWSER_CHANNEL
    ? { channel: process.env.BROWSER_CHANNEL }
    : {}),
});

async function layout(page) {
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Horizontal overflow",
  );
  const overflowing = await page.locator("button, a").evaluateAll((els) =>
    els
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          el.scrollWidth > el.clientWidth + 2
        );
      })
      .map((el) => el.textContent),
  );
  assert.deepEqual(overflowing, [], "Control text overflow");
}

try {
  for (const width of [1440, 768, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await layout(page);
    const workflow = page.locator("[data-workflow-preview]");
    await workflow
      .getByRole("tab", { name: "1. Upload", exact: true })
      .scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const movie = workflow.locator("video");
    assert(
      await movie.evaluate((el) => el.paused && !el.getAttribute("src")),
      "Reduced motion unexpectedly loaded/autoplayed the demo",
    );
    const heights = [];
    const frameHashes = [];
    const asset = demo.desktop;
    await workflow
      .getByRole("button", { name: "Play workflow demo", exact: true })
      .click();
    for (const [index, label] of [
      "1. Upload",
      "2. Comment",
      "3. Approve",
    ].entries()) {
      await workflow.getByRole("tab", { name: label, exact: true }).click();
      await page.waitForFunction((start) => {
        const video = document.querySelector("[data-workflow-preview] video");
        return (
          video.readyState >= 2 &&
          !video.paused &&
          !video.seeking &&
          video.currentTime >= start + 0.12
        );
      }, asset.chapters[index].start);
      await workflow
        .getByRole("button", { name: "Pause demo", exact: true })
        .click();
      assert(await movie.evaluate((el) => el.paused));
      const dimensions = await movie.evaluate((el) => ({
        width: el.videoWidth,
        height: el.videoHeight,
        src: el.currentSrc,
        time: el.currentTime,
        boxWidth: el.getBoundingClientRect().width,
        boxHeight: el.getBoundingClientRect().height,
      }));
      assert.equal(dimensions.width, asset.width);
      assert.equal(dimensions.height, asset.height);
      assert(dimensions.src.endsWith(asset.src));
      assert(
        Math.abs(
          dimensions.boxWidth / dimensions.boxHeight -
            asset.width / asset.height,
        ) < 0.02,
        "Desktop recording aspect ratio is not preserved",
      );
      assert(
        dimensions.time >= asset.chapters[index].start - 0.1 &&
          dimensions.time < asset.chapters[index].start + 2,
      );
      heights.push(dimensions.boxHeight);
      const pixels = await movie.evaluate((el) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 32;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(el, 0, 0, 32, 32);
        return Array.from(ctx.getImageData(0, 0, 32, 32).data);
      });
      const rgb = pixels.filter((_, i) => i % 4 !== 3);
      const mean = rgb.reduce((a, b) => a + b, 0) / rgb.length;
      assert(
        Math.sqrt(
          rgb.reduce((total, value) => total + (value - mean) ** 2, 0) /
            rgb.length,
        ) > 3,
        `Video frame is blank at ${width}px in ${label}`,
      );
      frameHashes.push(
        createHash("sha256").update(Buffer.from(pixels)).digest("hex"),
      );
      await layout(page);
    }
    assert.equal(
      new Set(frameHashes).size,
      3,
      "All video chapters render the same frame",
    );
    assert(
      Math.max(...heights) - Math.min(...heights) < 1,
      "Demo frame jumps between chapters",
    );
    await workflow
      .getByRole("button", { name: "Replay demo", exact: true })
      .click();
    await page.waitForFunction(() => {
      const video = document.querySelector("[data-workflow-preview] video");
      return !video.paused && video.currentTime < 2;
    });
    await workflow
      .getByRole("button", { name: "Pause demo", exact: true })
      .click();
    await workflow.getByRole("tab", { name: "1. Upload", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() =>
      document
        .querySelector(
          '[data-workflow-preview] [role="tab"][aria-selected="true"]',
        )
        ?.textContent?.includes("Comment"),
    );
    assert.equal(
      await workflow
        .getByRole("tab", { name: "2. Comment", exact: true })
        .getAttribute("aria-selected"),
      "true",
    );
    await workflow
      .getByRole("button", { name: "Pause demo", exact: true })
      .click();
    await workflow.evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 100),
    );
    await page.screenshot({ path: `/tmp/album-workflow-${width}.png` });

    const plans = page.locator("#access");
    for (const price of ["$0", "$12", "$29", "$79"])
      assert(await plans.getByText(price, { exact: true }).isVisible());
    assert(
      !/Sample files only|Changes are temporary|Paid plans are not available/.test(
        await plans.innerText(),
      ),
    );
    assert.equal(
      await plans.getByRole("link", { name: /try studio preview/ }).count(),
      4,
    );
    await plans.evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 50),
    );
    await page.screenshot({ path: `/tmp/album-prices-${width}.png` });
    await page.goto(`${base}/pricing`);
    await layout(page);
    for (const price of ["$0", "$12", "$29", "$79"])
      assert(await page.getByText(price, { exact: true }).isVisible());
    assert(
      !/Sample files only|Changes are temporary|not live offers/.test(
        await page.locator("main").innerText(),
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      `Homepage, pricing, decoded video chapters, playback controls and keyboard tabs passed at ${width}px`,
    );
    await context.close();
  }

  const auto = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const automatic = await auto.newPage();
  let downloads = 0;
  automatic.on("request", (request) => {
    if (request.url().endsWith(".mp4")) downloads++;
  });
  await automatic.goto(base);
  await automatic.waitForTimeout(400);
  assert.equal(downloads, 0, "Demo downloads before the workflow is visible");
  await automatic
    .locator("[data-workflow-preview] figure")
    .scrollIntoViewIfNeeded();
  await automatic.waitForFunction(() => {
    const video = document.querySelector("[data-workflow-preview] video");
    return video.readyState >= 2 && !video.paused && video.currentTime > 0.3;
  });
  await automatic.locator("footer").scrollIntoViewIfNeeded();
  await automatic.waitForFunction(
    () => document.querySelector("[data-workflow-preview] video").paused,
  );
  await automatic
    .locator("[data-workflow-preview] figure")
    .scrollIntoViewIfNeeded();
  await automatic.waitForFunction(
    () => !document.querySelector("[data-workflow-preview] video").paused,
  );
  await automatic
    .getByRole("button", { name: "Pause demo", exact: true })
    .click();
  await automatic.locator("footer").scrollIntoViewIfNeeded();
  await automatic
    .locator("[data-workflow-preview] figure")
    .scrollIntoViewIfNeeded();
  await automatic.waitForTimeout(300);
  assert(
    await automatic
      .locator("[data-workflow-preview] video")
      .evaluate((el) => el.paused),
    "Manual pause is ignored on re-entry",
  );
  await automatic
    .getByRole("button", { name: "Play demo", exact: true })
    .click();
  await automatic.emulateMedia({ reducedMotion: "reduce" });
  await automatic.waitForFunction(
    () => document.querySelector("[data-workflow-preview] video").paused,
  );
  await auto.close();

  const saving = await browser.newContext();
  await saving.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: { saveData: true },
    }),
  );
  const savingPage = await saving.newPage();
  await savingPage.goto(base);
  await savingPage
    .locator("[data-workflow-preview] figure")
    .scrollIntoViewIfNeeded();
  await savingPage.waitForTimeout(300);
  assert(
    await savingPage
      .locator("[data-workflow-preview] video")
      .evaluate((el) => !el.getAttribute("src") && el.paused),
    "Save Data unexpectedly downloads/autoplays",
  );
  await saving.close();

  const broken = await browser.newContext({ reducedMotion: "reduce" });
  await broken.route("**/*.mp4", (route) => route.abort());
  const brokenPage = await broken.newPage();
  await brokenPage.goto(base);
  await brokenPage
    .getByRole("button", { name: "Play workflow demo", exact: true })
    .click();
  await brokenPage
    .getByRole("status")
    .filter({ hasText: "The video could not load" })
    .waitFor();
  assert(
    await brokenPage
      .locator("[data-workflow-preview]")
      .getByRole("img")
      .isVisible(),
  );
  assert.equal(
    await brokenPage
      .locator("[data-workflow-preview]")
      .getByRole("link")
      .getAttribute("href"),
    "/proof/demo-proof-token",
  );
  await broken.close();
  console.log(
    "Deferred autoplay, offscreen pause, manual pause, live motion preferences, Save Data and failed-media fallback passed",
  );

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}/proof/demo-proof-token`);
  await page.waitForFunction(() =>
    [...document.images].some(
      (img) => img.naturalWidth > 0 && img.src.includes("/demo/maya-liam/"),
    ),
  );
  let cookie;
  for (let retry = 0; retry < 40; retry++) {
    cookie = (await context.cookies()).find(
      (item) => item.name === "album_approve_demo_funnel",
    );
    if (cookie) break;
    await page.waitForTimeout(100);
  }
  assert(
    cookie?.value.includes(".viewed."),
    "Hydrated visible demo visit was not recorded",
  );
  assert(cookie.httpOnly && cookie.sameSite === "Lax");
  await page.reload();
  await page.getByRole("button", { name: "Add comment", exact: true }).click();
  await page
    .getByLabel("Spread comment", { exact: true })
    .fill("Marketing verification: keep this spread.");
  await page.getByRole("button", { name: "Save comment", exact: true }).click();
  await page.waitForURL(/#spread-/);
  const completed = (await context.cookies()).find(
    (item) => item.name === cookie.name,
  );
  assert(
    completed?.value.includes(".commented."),
    "Successful save did not record activation",
  );
  assert.equal(completed.value.split(".")[0], cookie.value.split(".")[0]);
  await context.close();

  const optedOut = await browser.newContext({ extraHTTPHeaders: { DNT: "1" } });
  const privatePage = await optedOut.newPage();
  await privatePage.goto(`${base}/proof/demo-proof-token`);
  await privatePage
    .getByRole("button", { name: "Add comment", exact: true })
    .waitFor();
  await privatePage.waitForTimeout(500);
  assert(
    !(await optedOut.cookies()).some(
      (item) => item.name === "album_approve_demo_funnel",
    ),
  );
  await optedOut.close();
  console.log(
    "Demo visit, comment activation, session continuity and DNT checks passed",
  );
} finally {
  await browser.close();
}
