# ADR 0005: Use Workers For A Disposable Hosted Preview

## Status

Accepted for the hosted preview only; not a production persistence decision.

## Context

The app needs Server Actions, signed asset route handlers, and server-rendered dashboard/proof pages. A static Next.js export would remove those flows. The local JSON store and private filesystem uploads are not durable storage on Cloudflare Workers.

## Decision

Deploy the existing Next.js app through OpenNext to Cloudflare Workers. Set `PROOFALBUM_STORAGE=memory` in `wrangler.jsonc`: `src/server/store.ts` holds seeded application data in `globalThis`, and `src/server/storage.ts` holds uploaded bytes in an isolate-local Map. Deliver fictional sample spreads and the workflow video through the public ASSETS binding.

Keep the preview self-contained, but explicitly describe it as non-durable. Supabase has a schema and readiness check, not an implemented application persistence adapter. Durable private object storage and production identity remain separate implementation work.

## Consequences

- The hosted preview exercises real upload, comment, replacement, and approval actions without external database/storage credentials.
- Isolate recycling or deployment can discard projects, uploaded files, comments, and approval records. Separate isolates do not share mutations; even a later request is not guaranteed to see a saved change.
- Public bundled assets survive as deployment artifacts. Uploaded files do not gain that durability or become public assets.
- A successful save or approval is not a storage guarantee. The preview is unsuitable for real client work, paid production use, or an approval archive.
- Production requires database-backed repository operations, durable private uploads, production auth, rate limits, and cross-request/isolation tests before this mode can be retired.
