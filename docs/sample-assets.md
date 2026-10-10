# Sample Album And Product Visuals

The demo uses four photographic spreads of fictional people: opening, ceremony,
portraits, and reception. The images were generated for this project. They are
not a real client wedding, customer endorsement, or example of AI album design
functionality offered by the application.

## Assets

- Original flat spreads: `assets/demo/maya-liam/*.png`.
- Optimized full spreads: `public/demo/maya-liam/*.webp`.
- 320px thumbnails: `public/demo/maya-liam/*-thumb.webp`.
- Dimensions, file sizes, and public sample allowlist: `src/lib/demo-album-assets.json`.

Run `npm run assets:demo` after replacing an original. The script uses the sharp
installation already included with Next.js and regenerates the WebP files and
metadata. Original files stay outside `public`; browsers only load optimized
assets. The catalog must be committed alongside regenerated assets.

Only the exact catalog keys are mapped to public URLs. User uploads, including
replacements of sample spreads, keep their signed private asset URLs. Legacy
sample SVG keys are upgraded on read without changing spread IDs, comments,
version IDs, or user-uploaded replacements.

## Visual Review

`scripts/verify-album-visuals.mjs` starts a production build locally, checks
desktop/mobile layouts and real review interactions with Playwright, and captures:

- `public/product/proof-desktop.webp`: actual client proof interface.
- `public/product/comments-detail.webp`: actual pinned-comment interaction.
- `public/product/approval-detail.webp`: actual approval confirmation.
- Desktop and mobile overview captures in `public/product`.
- Capture metadata and test results in `docs/visual-review/report.json`.

The screenshots use the generated sample wedding only. No real client content
is captured. The workflow on the review branch runs lint, typecheck, Vitest,
build, browser checks, and `git diff --check`. It publishes generated assets and
successful screenshots to that review branch only, never to main or the live
deployment. The report records the source commit and capture time.

For a local browser pass, install Playwright temporarily, install Chromium, and
run the script after `npm run build`. No browser-test package is added to the
application's production dependencies.

## Remaining Limits

This is a visual and rendering pass, not a production backend rollout. The hosted
preview still uses disposable demo storage. PDF imports still create page
placeholders; they do not render the uploaded PDF pages. Use JPG/PNG exports to
review actual designs. Production auth, durable storage, rate limits, and billing
activation remain separate work.
