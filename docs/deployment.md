# Deployment Notes

## Vercel

Deploy the app as a standard Next.js project. Set all variables from `.env.example` in the Vercel project before production traffic.

## Supabase

Run `supabase/migrations/0001_initial_schema.sql`, create a private `album-spreads` bucket, and use a service role key only on the server. If you expose Supabase from the browser later, keep RLS policies enabled and test token isolation. `src/server/repository.ts` exposes a schema readiness check so production bootstrapping can fail early when Supabase is misconfigured.

## Stripe

Create Starter, Pro, and Studio recurring prices. Set the corresponding price IDs and point a webhook endpoint at `/api/stripe/webhook`.

## Email

Verify a sending domain in Resend or Postmark. The email boundary is `src/server/email.ts`, so replacing providers should not change dashboard or proofing code.

## Production Hardening

Add rate limiting, background image/PDF rendering, file scanning if required by your customer segment, structured logging, and monitoring for webhook failures.
