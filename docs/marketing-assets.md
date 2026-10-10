# Product walkthrough assets

The homepage walkthrough plays actual recordings of a fictional client album,
not an animated mock interface. The desktop recording is shown at every screen
size, scaling proportionally without cropping; native fullscreen allows a closer
look. It shows four spreads being uploaded, a pinned comment being saved, and a
version-specific approval being confirmed. A mobile recording is retained as a
reference asset but is not used on the homepage. The studio resolves the saved note between the comment
and approval scenes; that handoff is omitted from the short recording.

Start a local sample workspace, then run:

```sh
PROOFALBUM_STORAGE=memory npm run dev
node scripts/record-workflow-demo.mjs
```

The capture requires an existing Playwright installation and its Chromium browser.
`PLAYWRIGHT_MODULE` can point to a bundled Playwright module without adding a project
dependency. Set `BROWSER_CHANNEL=chrome` to use an installed Chrome browser.
`BASE_URL` defaults to `http://localhost:3000` and only accepts loopback hosts.
The video recorder also needs local `ffmpeg`. It creates two H.264 MP4s with
fast-start metadata, WebP posters, English descriptive caption tracks, and a
chapter manifest in `src/lib/workflow-demo-assets.json`. It creates fictional
projects and submits real uploads, comments, resolutions, and approvals only
against the local workspace. Raw recordings stay outside the repo under `/tmp`.
Restart memory mode afterward to clear these projects. The older non-mutating
`scripts/capture-workflow-assets.mjs` still produces static reference screenshots.

Playback is deferred until the section enters the viewport. Reduced-motion and
data-saving visitors see a still poster until they choose to play. Autoplay is
silent, offscreen playback pauses, and native video controls provide seeking and
fullscreen alongside the chapter, play/pause, and replay buttons. Failed video
loads retain a poster and a working link to the interactive proof.

Run `node scripts/verify-marketing.mjs` against the local production preview to
check homepage pricing, decoded frames in all three video chapters, playback and keyboard controls,
overflow at 1440/768/390/320px, and the demo visit-to-comment flow. This check saves
one test comment in the local sample workspace; restart memory mode afterward to
restore the untouched demo. It accepts the same browser environment variables.

## Demo activation measurement

Only the public `/proof/demo-proof-token` page records `demo_proof_viewed` and
`demo_first_comment_saved` events. Visits begin when the hydrated page is visible;
prefetches do not count. A comment event is emitted only after a successful save.
A signed, HttpOnly, session cookie scoped to the demo proof suppresses repeated
visits and comments within that browser session. Do Not Track and Global Privacy
Control opt-outs are respected. Events contain only a random session ID, event
name, timestamp, and event type; no names, emails, comment bodies, or IP addresses.

Events appear as JSON in server logs (Cloudflare observability is already enabled)
or in `npx wrangler tail album-approve`. This is best-effort diagnostic measurement,
not a durable analytics database: cookies can be cleared, requests can race, logs
can be sampled or expire, and sessions are not unique people. When analyzing logs,
deduplicate by `(sessionId, event)` and divide sessions with a first saved comment
by sessions with a demo visit in the same observation window. Private client proofs
are not measured. Measurement failure never blocks feedback.
