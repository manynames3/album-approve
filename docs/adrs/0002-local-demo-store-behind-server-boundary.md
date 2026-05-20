# ADR 0002: Keep A Local Preview Store Behind A Server Boundary

## Status

Accepted.

## Context

The app should be easy to run locally without requiring Supabase, Stripe, Resend, or object storage credentials. At the same time, the data model should resemble the production domain: studios, clients, projects, versions, spreads, links, comments, approvals, subscriptions, and email events.

## Decision

Use a seeded JSON store under `.data` for the local preview and centralize reads and writes in `src/server/store.ts`. Keep a Supabase migration and admin-client readiness check as the production database boundary.

## Consequences

- `npm run seed` creates a repeatable preview state for local review and tests.
- The preview avoids placeholder external credentials and remains portable.
- The JSON store is not a concurrent production database, so replacing it with Supabase queries is a known production hardening step.
