import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const DEFAULT_DEV_SECRET = "proofalbum-local-development-secret";

function appSecret() {
  const configuredSecret = process.env.PROOFALBUM_SECRET;

  if (configuredSecret) {
    return configuredSecret;
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.PROOFALBUM_STORAGE !== "memory"
  ) {
    throw new Error("PROOFALBUM_SECRET is required in production.");
  }

  return DEFAULT_DEV_SECRET;
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}_${randomBytes(9).toString("hex")}`;
}

export function createShareToken() {
  return randomBytes(24).toString("base64url");
}

export function hmacDigest(value: string) {
  return createHmac("sha256", appSecret()).update(value).digest("hex");
}

export function hashShareToken(token: string) {
  return hmacDigest(`share:${token}`);
}

export function signValue(value: string) {
  return hmacDigest(`signed:${value}`);
}

export function isSafeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.byteLength !== right.byteLength) {
    return false;
  }

  return timingSafeEqual(left, right);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, encoded?: string) {
  if (!encoded) {
    return true;
  }

  const [salt, hash] = encoded.split(":");
  if (!salt || !hash) {
    return false;
  }

  const candidate = scryptSync(password, salt, 32).toString("hex");
  return isSafeEqual(candidate, hash);
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "studio";
}

export function hashIp(ip: string | null) {
  if (!ip) {
    return undefined;
  }

  return hmacDigest(`ip:${ip}`);
}
