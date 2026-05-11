import path from "node:path";
import { hmacDigest, isSafeEqual } from "@/server/security";

const ASSET_TTL_SECONDS = 60 * 60;

type AssetGlobal = typeof globalThis & {
  __proofAlbumMemoryAssets?: Map<string, Buffer>;
};

export const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
export const ACCEPTED_PDF_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
]);
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_PDF_UPLOAD_BYTES = 50 * 1024 * 1024;

function shouldUseMemoryStorage() {
  return process.env.PROOFALBUM_STORAGE === "memory";
}

function memoryAssets() {
  const store = globalThis as AssetGlobal;
  store.__proofAlbumMemoryAssets ||= new Map<string, Buffer>();
  return store.__proofAlbumMemoryAssets;
}

async function fsPromises() {
  return import("node:fs/promises");
}

function dataRoot() {
  const testOverride =
    process.env.NODE_ENV === "test"
      ? process.env.PROOFALBUM_DATA_DIR
      : undefined;

  return testOverride || path.join(process.cwd(), ".data");
}

export function uploadsRoot() {
  return path.join(dataRoot(), "uploads");
}

export function normalizeStorageKey(storageKey: string) {
  const normalized = storageKey.replaceAll("\\", "/").replace(/^\/+/, "");

  if (
    !normalized ||
    normalized.includes("..") ||
    !/^[a-zA-Z0-9/_\-.]+$/.test(normalized)
  ) {
    throw new Error("Invalid storage key");
  }

  return normalized;
}

export function storagePath(storageKey: string) {
  const normalized = normalizeStorageKey(storageKey);
  return path.join(uploadsRoot(), normalized);
}

export function signAsset(storageKey: string, expiresAt: number) {
  return hmacDigest(`asset:${normalizeStorageKey(storageKey)}:${expiresAt}`);
}

export function verifyAssetSignature(
  storageKey: string,
  expiresAt: string | null,
  signature: string | null,
) {
  if (!expiresAt || !signature) {
    return false;
  }

  const expires = Number(expiresAt);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  return isSafeEqual(signature, signAsset(storageKey, expires));
}

export function signedAssetUrl(
  storageKey: string,
  ttlSeconds = ASSET_TTL_SECONDS,
) {
  const normalized = normalizeStorageKey(storageKey);
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const signature = signAsset(normalized, expires);
  const encodedPath = normalized
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `/api/assets/${encodedPath}?expires=${expires}&signature=${signature}`;
}

export function contentTypeForKey(storageKey: string) {
  const lower = storageKey.toLowerCase();

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (lower.endsWith(".pdf")) {
    return "application/pdf";
  }

  return "application/octet-stream";
}

export async function readStoredAsset(storageKey: string) {
  const key = normalizeStorageKey(storageKey);

  if (shouldUseMemoryStorage()) {
    const bytes = memoryAssets().get(key);
    if (!bytes) {
      throw new Error("Asset not found.");
    }

    return {
      bytes: Buffer.from(bytes),
      size: bytes.byteLength,
      contentType: contentTypeForKey(key),
    };
  }

  const filePath = storagePath(key);
  const { readFile, stat } = await fsPromises();
  const [bytes, fileStat] = await Promise.all([
    readFile(filePath),
    stat(filePath),
  ]);

  return {
    bytes,
    size: fileStat.size,
    contentType: contentTypeForKey(key),
  };
}

export async function writeStoredAsset(storageKey: string, bytes: Buffer) {
  if (shouldUseMemoryStorage()) {
    memoryAssets().set(normalizeStorageKey(storageKey), Buffer.from(bytes));
    return;
  }

  const filePath = storagePath(storageKey);
  const { mkdir, writeFile } = await fsPromises();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
}

async function storedAssetExists(storageKey: string) {
  const key = normalizeStorageKey(storageKey);

  if (shouldUseMemoryStorage()) {
    return memoryAssets().has(key);
  }

  try {
    const { stat } = await fsPromises();
    await stat(storagePath(key));
    return true;
  } catch {
    return false;
  }
}

export function validateUploadFile(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if (ACCEPTED_IMAGE_TYPES.has(file.type)) {
    if (![".jpg", ".jpeg", ".png"].includes(extension)) {
      throw new Error("Spread file extension must be .jpg, .jpeg, or .png.");
    }

    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      throw new Error("Each spread must be between 1 byte and 15 MB.");
    }

    return;
  }

  if (ACCEPTED_PDF_TYPES.has(file.type) || extension === ".pdf") {
    if (extension !== ".pdf") {
      throw new Error("PDF imports must use a .pdf extension.");
    }

    if (file.size <= 0 || file.size > MAX_PDF_UPLOAD_BYTES) {
      throw new Error("PDF imports must be between 1 byte and 50 MB.");
    }

    return;
  }

  throw new Error("Upload JPG, PNG, or PDF files only.");
}

export function isPdfFile(file: File) {
  return (
    ACCEPTED_PDF_TYPES.has(file.type) ||
    path.extname(file.name).toLowerCase() === ".pdf"
  );
}

export function detectImageDimensions(bytes: Buffer, mimeType: string) {
  if (
    mimeType === "image/png" &&
    bytes.length >= 24 &&
    bytes.toString("ascii", 1, 4) === "PNG"
  ) {
    return {
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    };
  }

  if (mimeType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;

    while (offset < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = bytes[offset + 1];
      const length = bytes.readUInt16BE(offset + 2);
      const isStartOfFrame =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker);

      if (isStartOfFrame) {
        return {
          width: bytes.readUInt16BE(offset + 7),
          height: bytes.readUInt16BE(offset + 5),
        };
      }

      offset += 2 + length;
    }
  }

  return { width: 1400, height: 900 };
}

export function estimatePdfPageCount(bytes: Buffer) {
  const text = bytes.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page\b/g);
  const count = matches?.length || 1;

  return Math.max(1, Math.min(count, 60));
}

export function pdfPagePlaceholderSvg(input: {
  filename: string;
  page: number;
  pageCount: number;
  accent?: string;
}) {
  const accent = input.accent || "#0f766e";
  const title = escapeXml(input.filename);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <rect width="1400" height="900" fill="#f8fafc"/>
  <rect x="120" y="72" width="1160" height="756" rx="24" fill="#ffffff" stroke="#d4d4d8" stroke-width="2"/>
  <rect x="188" y="150" width="450" height="600" rx="10" fill="${accent}" opacity="0.92"/>
  <rect x="704" y="178" width="390" height="28" rx="14" fill="#111827" opacity="0.82"/>
  <rect x="704" y="246" width="476" height="20" rx="10" fill="#71717a" opacity="0.45"/>
  <rect x="704" y="294" width="420" height="20" rx="10" fill="#71717a" opacity="0.32"/>
  <rect x="704" y="342" width="500" height="20" rx="10" fill="#71717a" opacity="0.24"/>
  <rect x="704" y="596" width="276" height="20" rx="10" fill="#71717a" opacity="0.3"/>
  <text x="414" y="470" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">PDF</text>
  <text x="414" y="540" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="600" fill="#e0f2fe">Page ${input.page}</text>
  <text x="704" y="696" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="700" fill="#18181b">${title}</text>
  <text x="704" y="738" font-family="Inter, Arial, sans-serif" font-size="24" fill="#52525b">Imported page ${input.page} of ${input.pageCount}</text>
</svg>`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function ensureDemoAsset(
  storageKey: string,
  title: string,
  subtitle: string,
  accent = "#0f766e",
) {
  if (await storedAssetExists(storageKey)) {
    return;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f8fafc"/>
      <stop offset="0.48" stop-color="#eef2f7"/>
      <stop offset="1" stop-color="#dbeafe"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="900" fill="url(#bg)"/>
  <rect x="92" y="82" width="1216" height="736" rx="22" fill="#ffffff" stroke="#d1d5db" stroke-width="2"/>
  <rect x="134" y="124" width="570" height="652" rx="14" fill="#111827"/>
  <rect x="726" y="124" width="540" height="308" rx="14" fill="${accent}" opacity="0.92"/>
  <rect x="726" y="468" width="540" height="308" rx="14" fill="#f59e0b" opacity="0.88"/>
  <circle cx="306" cy="302" r="96" fill="#f8fafc" opacity="0.92"/>
  <rect x="222" y="464" width="398" height="36" rx="18" fill="#f8fafc" opacity="0.84"/>
  <rect x="222" y="530" width="300" height="26" rx="13" fill="#f8fafc" opacity="0.62"/>
  <text x="996" y="288" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="700" fill="#ffffff">${title}</text>
  <text x="996" y="632" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="600" fill="#111827">${subtitle}</text>
</svg>`;

  await writeStoredAsset(storageKey, Buffer.from(svg));
}
