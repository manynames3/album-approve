# Local Scrollcraft Gallery Preview

## Brief

Authored implementation decisions within the user's supplied photographic-gallery brief, not invented interview answers.

- Audience: wedding/portrait photographers and album designers; clients use a separate guest proof.
- Vibe: photographic, spacious, precise, restrained. Existing white/teal brand and gallery labels, not another brand's assets.
- Journey: album draft -> specific pinned note -> corresponding uploaded replacement -> recorded version approval -> plans/demo.
- Energy: still opening, focused feedback, largest visual change at the replacement, settled approval.
- Feeling curve: recognition (an uncropped album), clarity (a note beside its location), relief (that exact spread replaced), confidence (explicit decision), intent (reachable plans/demo).
- Peak: "The note pointed to one spread, and I could compare the replacement it asked for." Revision comparison receives the largest media area; there is no empty pinned scroll or manufactured suspense.
- Signature: the same fictional album/note is traced through real UI captures and an inspectable draft/replacement comparison. This is a marketing illustration, not an interactive editing surface.
- Structure: gallery of workflow artifacts, index navigation, native document flow. No worldflight, scroll locking, cinematic clip scrubbing, fake dashboard, or animated editing controls.
- Assets: only the repository's generated fictional wedding images and real captures from disposable local data. No KIE API, new AI assets, paid services, testimonials, or invented metrics.
- CTA: View demo proof. Existing `/proof/demo-proof-token`, `/sign-in`, `/sign-up`, and `/pricing` routes remain intact.
- Motion: layered draft parallax, one-time feedback entrance, replacement wipe, small pointer tilt on a photographic object. All meaningful labels remain readable; no motion is required to understand or navigate.
- Static path: all copy and assets are server-rendered. Reduced motion and unavailable JS/CSS-scope/engine retain the full story. Pricing is reachable in the header without scrolling the gallery.
- Silence: no authored blank screens or empty holds.
- Tell-someone sentence: "It's the page where you follow one album note through the replaced spread and its approval."

## Upstream Review

Scrollcraft source: https://github.com/nateherkai/scroll-craft

Reviewed revision: `75d81f74e83692add18cd7a8a8e078b8a887a579`. MIT notice retained in `public/vendor/scrollcraft/LICENSE`. Full skill, engine JS/CSS, and every script were inspected before execution. The engine JS and CSS are copied byte-for-byte, not forked. Scripts are used from the reviewed external checkout, not installed globally.

`doctor.mjs` and `workspace.mjs --ensure` are local preflight/workspace operations. `shoot.mjs` runs the browser/pixel/contact-sheet pass against loopback only. `kie.mjs` is not executed; no API probe or asset upload occurs. `serve.mjs` is unnecessary because the actual Next.js site supplies the preview. `encode.sh` and `worldflight-assert.mjs` are inapplicable: the story uses stills and native scrolling, not scrub/worldflight media.

Mac preflight: Node 22, installed Chrome, bundled Playwright, and full ffmpeg detected. The ffmpeg build lacks libwebp; existing Sharp handles WebP asset optimization. KIE credentials are absent and unnecessary. `SCROLLCRAFT_HOME` points to an isolated temporary lab; the fingerprint registry was empty, so no prior rows constrain this first local build.

## Containment

The marketing runtime mounts only its root. The exact upstream stylesheet is wrapped in native CSS `@scope` when attached; its document resets do not apply outside the marketing root. It does not import global vendor CSS into the Next.js layout. Teardown calls the upstream `destroy()`, removes the owned stylesheet/script, aborts pending stylesheet loading, restores changed element styles/classes, and unregisters route-local observers/listeners. No authenticated route, shared proof component, Server Action, or approval rule is edited.

This is an isolated worktree on `codex/scrollcraft-gallery`, based on `893f393`. The original dirty README/architecture documents were copied unchanged into it. The initial task excluded push and deployment; the user separately authorized release on 2026-10-13.

## Evidence And Limits

Browser screenshots and upstream reports are kept in the local Scrollcraft lab. The validation summary is added after the final rendered pass, not inferred from successful compilation. Real iPhone/Safari and physical trackpad feel require separate device checks; Chrome emulation does not establish those results.

The hosted preview still uses non-durable isolate memory. Production storage/auth/billing work is not part of this marketing change.

## Verified Local Result

Preview: http://localhost:3001/ (production Next.js server, isolated worktree, memory-backed fictional sample data).

Verified on macOS Chrome on 2026-10-13:

- `npm test`: 25 tests passed, including upstream engine/CSS byte hashes and MIT notice.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`: passed.
- Existing `scripts/verify-marketing.mjs`: passed at 1440, 768, 390, and 320 pixels. Covers pricing, video chapters, playback/keyboard controls, autoplay deferral, reduced motion, Save-Data, failed-video fallback, and demo activation/DNT. No payment or production persistence claim follows from these tests.
- Added regression: chapter link -> demo proof -> native Back. The marketing engine and owned stylesheet disappear on the proof route; returning mounts exactly one engine instance. Plain fragment anchors initially broke Next.js Back restoration; router-aware links fixed the reproduced failure.
- Reviewed upstream `shoot.mjs`: 40 desktop, 41 mobile, and 41 reduced-motion settled samples (122 total). Final reviewed reports contain no console errors or failed requests. Earlier reports with a missing capture, eager route prefetch cancellation, or a stopped server were superseded after fixes; they are not passing evidence.
- Native scrolling, header pricing/demo links, keyboard skip link and revision slider, live reduced-motion switching, and blocked-engine static fallback were checked in the browser. A settled mobile feedback capture confirms its one-time entrance completes after chapter navigation.
- With script execution disabled, the full story and prices remain server-rendered; comparison exports use an unmasked static grid.
- Sampled live body/header text contrast in draft, feedback, revision, and trust sections had a minimum ratio of 6.06:1. This is not a full accessibility certification or OCR audit of the screenshots.
- Original dirty documentation matches the source checkout byte-for-byte. No diff in authenticated routes, proof components, Server Actions, or server modules.

Reproduce the existing browser suite with the installed local browser dependencies:

```sh
BASE_URL=http://localhost:3001 \
PLAYWRIGHT_MODULE=/Users/aiden/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright \
BROWSER_CHANNEL=chrome node scripts/verify-marketing.mjs
```

The Scrollcraft harness is run from the pinned external checkout with `SCROLLCRAFT_HOME=/private/tmp/album-scrollcraft-lab`, the bundled dependency directory as `NODE_PATH`, and the installed Chrome path as `SCROLLCRAFT_CHROME`. It is not a project dependency. Flow sections are excluded from its dead-scroll test, and this page has no progress-cued text for its contrast detector. Intermediate-frame inspection, direct DOM contrast checks, native navigation, and static-fallback checks supplement those limits.

## Screenshots

Local QA artifacts (not committed product assets):

- [Desktop opening](/private/tmp/album-scrollcraft-lab/lab/final-desktop.png)
- [Desktop revision, intermediate wipe](/private/tmp/album-scrollcraft-lab/lab/final-revision.png)
- [Mobile opening](/private/tmp/album-scrollcraft-lab/lab/final-mobile.png)
- [Mobile feedback, settled](/private/tmp/album-scrollcraft-lab/lab/final-mobile-feedback.png)
- [Visible pricing](/private/tmp/album-scrollcraft-lab/lab/pricing-desktop.png)
- [Reduced-motion revision](/private/tmp/album-scrollcraft-lab/lab/reduced-revision.png)
- [JavaScript-disabled opening](/private/tmp/album-scrollcraft-lab/lab/no-javascript.png)
- [Desktop intermediate contact sheet](/private/tmp/album-scrollcraft-lab/lab/desktop-reviewed/sheet.png)
- [Mobile intermediate contact sheet](/private/tmp/album-scrollcraft-lab/lab/mobile-reviewed/sheet.png)

## Changed Files

Changes made for this task:

- `src/app/page.tsx`: uses the integrated marketing homepage, not a separate mockup.
- `src/components/marketing/gallery-home.tsx`: photographic story, actual workflow captures, reachable pricing/CTAs, deferred existing video, factual trust/limitations.
- `src/components/marketing/gallery-landing.module.css`: route-scoped responsive gallery, keyboard focus, static/reduced-motion layouts.
- `src/components/marketing/scrollcraft-runtime.tsx`: client-only loading, contained CSS, engine mounting and teardown.
- `src/components/marketing/revision-comparison.tsx`: marketing-only comparison and native keyboard slider.
- `public/product/gallery/{feedback,replacement,approval,comment-detail}.webp` and `provenance.json`: optimized real UI captures of fictional local data, plus capture provenance.
- `public/vendor/scrollcraft/{scrollcraft.js,scrollcraft.css,LICENSE}`: unchanged pinned MIT engine and notice.
- `src/lib/scrollcraft.test.ts`: provenance/license regression tests.
- `scripts/verify-marketing.mjs`: existing video disclosure support and route cleanup/Back regression.
- `eslint.config.mjs`: ignores only the unchanged vendor directory.
- `docs/scrollcraft-preview.md`: implementation decisions and verified evidence.

Carried forward, not edited by this task: `README.md`, `docs/architecture.md`, `docs/deployment.md`, `docs/adrs/README.md`, and `docs/adrs/0005-workers-disposable-hosted-preview.md`.

## Remaining Limits

- Captures depict a labeled illustrative sequence with fictional sample photographs, not customer work or testimonials. The comparison is not an album-editing feature.
- Only Mac Chrome and emulated widths were tested. No physical iPhone, Safari, or trackpad claim is made. Browsers without native CSS scope receive the complete static page.
- Temporary worktree/lab paths are local artifacts. The server remains running, but neither its process nor memory data is durable across restart. The initial local-preview pass was not pushed or deployed; subsequent release requires separate authorization.
- No new dependency, KIE call, paid asset, billing activation, authenticated UI change, or approval-logic change is included.
