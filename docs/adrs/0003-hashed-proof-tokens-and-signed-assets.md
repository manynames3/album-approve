# ADR 0003: Use Hashed Proof Tokens And Signed Asset URLs

## Status

Accepted.

## Context

Proof links and album spreads are sensitive client-facing assets. The app should not expose raw storage keys or store reusable proof tokens in plaintext.

## Decision

Generate random proof tokens, store only HMAC token hashes, and reveal the raw token only when the link is created. Serve spread assets through `/api/assets/[...key]` with expiring HMAC signatures instead of exposing direct local storage paths.

## Consequences

- A database read does not reveal valid proof URLs.
- Asset URLs expire and are tied to the exact storage key.
- Route handlers must mediate asset access, which adds server work but keeps the access model explicit.
