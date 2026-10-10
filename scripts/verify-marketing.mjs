import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.BASE_URL || "http://localhost:3000";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Use a local sample workspace.",
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
    const heights = [];
    for (const label of ["1. Upload", "2. Review", "3. Approve"]) {
      await workflow.getByRole("tab", { name: label, exact: true }).click();
      const image = workflow.getByRole("tabpanel").locator("img");
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((img) => img.decode());
      const dimensions = await image.evaluate((img) => ({
        width: img.naturalWidth,
        height: img.naturalHeight,
        src: img.currentSrc,
        boxHeight: img.getBoundingClientRect().height,
      }));
      assert.equal(dimensions.width, width < 640 ? 390 : 1440);
      assert.equal(dimensions.height, width < 640 ? 844 : 1000);
      assert(
        dimensions.src.includes(width < 640 ? "mobile.webp" : "desktop.webp"),
      );
      heights.push(dimensions.boxHeight);
      await layout(page);
    }
    assert(
      Math.max(...heights) - Math.min(...heights) < 1,
      "Walkthrough frame jumps between steps",
    );
    await workflow.getByRole("tab", { name: "1. Upload", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() =>
      document
        .querySelector(
          '[data-workflow-preview] [role="tab"][aria-selected="true"]',
        )
        ?.textContent?.includes("2. Review"),
    );
    assert.equal(
      await workflow
        .getByRole("tab", { name: "2. Review", exact: true })
        .getAttribute("aria-selected"),
      "true",
    );
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
      `Homepage, pricing, responsive assets and keyboard tabs passed at ${width}px`,
    );
    await context.close();
  }

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
