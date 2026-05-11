# ADR 0001: Use Next.js App Router And Server Actions

## Status

Accepted.

## Context

Album Approve needs authenticated studio pages, public proofing pages, file uploads, form-heavy workflows, and server-side access to private secrets. The project should remain small enough for a portfolio reviewer to understand quickly.

## Decision

Use Next.js App Router for routes and rendering, React client components for interactive review and upload UI, and Server Actions for form mutations. API route handlers are reserved for asset delivery, CSV export, and third-party webhooks.

## Consequences

- The app keeps routing, rendering, and mutation logic in one TypeScript codebase.
- Server-only modules can own secrets, token hashing, storage signatures, and external API clients.
- Form workflows stay simple, but large uploads should eventually move to direct-to-storage uploads instead of Server Action request bodies.
