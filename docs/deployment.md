# Deployment Notes

## Cloudflare

The live demo deploys to Cloudflare Workers with the OpenNext Cloudflare adapter:

```bash
npm run deploy:cf
```

`wrangler.jsonc` configures the Worker name, OpenNext output, static assets binding, Node.js compatibility, and `PROOFALBUM_STORAGE=memory` for the hosted demo. The memory store keeps the demo self-contained, but it is not durable storage.

Cloudflare Pages is appropriate for static Next.js exports. This app uses Server Actions and route handlers, so the full-stack Cloudflare deployment uses Workers.

## GitHub Deployment

The `Deploy Cloudflare demo` workflow builds the actual OpenNext Worker, runs lint, type checking, and tests, and deploys only when both repository secrets are configured:

- `CLOUDFLARE_API_TOKEN`: a token authorized to edit Workers in the existing Cloudflare account.
- `CLOUDFLARE_ACCOUNT_ID`: the account that owns `album-approve.hangi87.workers.dev`.

The workflow runs manually on `main`, or when its own workflow file changes on `main`. Ordinary app pushes do not automatically deploy. Missing credentials skip deployment with an explicit warning; a green build alone does not mean the live site was updated. Successful deployments check the homepage, demo proof, and all four sample assets. Existing Worker runtime secrets remain managed separately in Cloudflare.

## Production Target

For production traffic, replace the hosted demo's memory storage with Supabase Postgres and private object storage. Set all variables from `.env.example` in Cloudflare before production traffic.

## Supabase

Run `supabase/migrations/0001_initial_schema.sql`, create a private `album-spreads` bucket, and use a service role key only on the server. If you expose Supabase from the browser later, keep RLS policies enabled and test token isolation. `src/server/repository.ts` exposes a schema readiness check so production bootstrapping can fail early when Supabase is misconfigured.

## Stripe

Create Starter, Pro, and Studio recurring prices. Set the corresponding price IDs and point a webhook endpoint at `/api/stripe/webhook`.

## Email

Verify a sending domain in Resend or Postmark. The email boundary is `src/server/email.ts`, so replacing providers should not change dashboard or proofing code.

## Production Hardening

Add rate limiting, background image/PDF rendering, file scanning if required by your customer segment, structured logging, and monitoring for webhook failures.
