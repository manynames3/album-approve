# ADR 0004: Isolate External Service Integrations

## Status

Accepted.

## Context

The app includes production-shaped billing, email, storage, and database responsibilities, but local setup should not require live third-party accounts.

## Decision

Wrap external services behind server modules: `src/server/billing.ts` for Stripe, `src/server/email.ts` for Resend, `src/server/supabase.ts` and `src/server/repository.ts` for Supabase, and `src/server/storage.ts` for asset storage. When credentials are missing, billing and email use local preview or logging behavior.

## Consequences

- The local preview remains usable without external services.
- Production migration points are easy to find and replace.
- Integration behavior must be tested again with real provider credentials before launch.
