# Product walkthrough assets

The homepage walkthrough uses actual browser captures of the fictional sample
workspace, not a mock interface. Desktop and mobile captures show file selection,
a pinned image-swap comment, and the version-specific approval confirmation.
The capture does not submit uploads or approvals.

Start a local sample workspace, then run:

```sh
PROOFALBUM_STORAGE=memory npm run dev
node scripts/capture-workflow-assets.mjs
```

The capture requires an existing Playwright installation and its Chromium browser.
`PLAYWRIGHT_MODULE` can point to a bundled Playwright module without adding a project
dependency. Set `BROWSER_CHANNEL=chrome` to use an installed Chrome browser.
`BASE_URL` defaults to `http://localhost:3000` and only accepts loopback hosts.
Captures are optimized WebP files in `public/product/workflow-*`.

Run `node scripts/verify-marketing.mjs` against the local production preview to
check homepage pricing, all three responsive screenshot panels, keyboard tabs,
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
