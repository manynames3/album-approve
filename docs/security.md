# Security Notes

Album Approve is structured so the demo works locally while the production boundaries stay explicit.

## Auth

Dashboard routes require a signed, HTTP-only session cookie. The local demo session is intentionally simple; production should replace it with Supabase Auth or Clerk and enforce studio membership in every mutation.

## Share Links

Proofing tokens are generated with cryptographic randomness and stored only as HMAC hashes. Password-protected links use scrypt hashes and a token-bound, HTTP-only proof access cookie after successful unlock.

## Asset Access

Uploaded files are private by default. The local asset route serves files only when an expiring HMAC signature matches the storage key. Production storage should use Supabase Storage signed URLs or a server-mediated endpoint with equivalent checks.

## Upload Validation

The MVP accepts JPG, PNG, and PDF files, validates MIME type, extension, and size, extracts image dimensions, enforces plan storage limits, and rejects path traversal in storage keys. Production should add PDF page rendering, malware scanning if needed, and background processing for large assets.

## Guest Actions

Guest comments and approvals are scoped through the share token's project and version. Production should add rate limits for password attempts, comment submission, and approval submission.

## Approvals

Approvals are append-only records tied to an album version. Approved versions receive an immutable `approved_at` timestamp; later changes should create a new album version instead of rewriting prior approval history.
