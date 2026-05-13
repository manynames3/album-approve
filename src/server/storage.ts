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
  const svg = weddingAlbumSpreadSvg({
    storageKey,
    title,
    subtitle,
    accent,
  });
  const bytes = Buffer.from(svg);

  if (await storedAssetExists(storageKey)) {
    const current = await readStoredAsset(storageKey);
    if (current.bytes.equals(bytes)) {
      return;
    }
  }

  await writeStoredAsset(storageKey, bytes);
}

function weddingAlbumSpreadSvg(input: {
  storageKey: string;
  title: string;
  subtitle: string;
  accent: string;
}) {
  const title = escapeXml(input.title);
  const subtitle = escapeXml(input.subtitle);

  if (input.storageKey.includes("cover")) {
    return weddingCoverSpread(title, subtitle, input.accent);
  }

  if (input.storageKey.includes("ceremony")) {
    return weddingCeremonySpread(title, subtitle, input.accent);
  }

  if (input.storageKey.includes("portraits")) {
    return weddingPortraitSpread(title, subtitle, input.accent);
  }

  if (input.storageKey.includes("reception")) {
    return weddingReceptionSpread(title, subtitle, input.accent);
  }

  return weddingCoverSpread(title, subtitle, input.accent);
}

function spreadShell(
  title: string,
  subtitle: string,
  accent: string,
  body: string,
) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="900" viewBox="0 0 1400 900" role="img" aria-label="${title} ${subtitle}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fffdf8"/>
      <stop offset="0.55" stop-color="#f7f1e6"/>
      <stop offset="1" stop-color="#ece2d2"/>
    </linearGradient>
    <linearGradient id="inkPhoto" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14181d"/>
      <stop offset="0.52" stop-color="#2f3832"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
    <linearGradient id="garden" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e9f1e8"/>
      <stop offset="0.5" stop-color="#9fb8a3"/>
      <stop offset="1" stop-color="#32483b"/>
    </linearGradient>
    <linearGradient id="champagne" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff7dc"/>
      <stop offset="0.54" stop-color="#e6be72"/>
      <stop offset="1" stop-color="#9c6a2c"/>
    </linearGradient>
    <linearGradient id="rose" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff1ed"/>
      <stop offset="0.55" stop-color="#d8a39b"/>
      <stop offset="1" stop-color="#7b3f3a"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#31281f" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="1400" height="900" fill="url(#paper)"/>
  <path d="M700 64v772" stroke="#d8cdbb" stroke-width="2" stroke-dasharray="10 18" opacity="0.7"/>
  ${body}
</svg>`;
}

function photoCard(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  label: string,
  extras = "",
) {
  return `<g filter="url(#softShadow)">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="8" fill="#ffffff"/>
    <rect x="${x + 18}" y="${y + 18}" width="${width - 36}" height="${height - 76}" rx="5" fill="${fill}"/>
    ${extras}
    <text x="${x + width / 2}" y="${y + height - 28}" text-anchor="middle" font-family="Georgia, serif" font-size="18" letter-spacing="3" fill="#746957">${escapeXml(label)}</text>
  </g>`;
}

function floralCorner(x: number, y: number, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" opacity="0.95">
    <path d="M0 72C54 36 92 12 158 2" fill="none" stroke="#738b66" stroke-width="5" stroke-linecap="round"/>
    <path d="M40 52c24-34 58-38 78-20-25 8-44 22-58 44z" fill="#9cb487"/>
    <path d="M96 24c18-24 47-26 62-10-20 5-36 16-48 34z" fill="#6f8d6a"/>
    <circle cx="18" cy="62" r="16" fill="#d9a197"/>
    <circle cx="52" cy="40" r="13" fill="#efd6c6"/>
    <circle cx="78" cy="28" r="10" fill="#c78379"/>
  </g>`;
}

function coupleSilhouette(x: number, y: number, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="#fffaf0" opacity="0.9">
    <circle cx="32" cy="24" r="20"/>
    <circle cx="88" cy="22" r="18"/>
    <path d="M4 126c8-58 28-84 62-84 30 0 50 26 58 84z"/>
    <path d="M66 126c7-56 25-82 54-82 26 0 43 26 50 82z" opacity="0.82"/>
  </g>`;
}

function weddingCoverSpread(title: string, subtitle: string, accent: string) {
  const body = `
  <rect x="86" y="76" width="562" height="748" rx="10" fill="url(#inkPhoto)" filter="url(#softShadow)"/>
  <circle cx="354" cy="286" r="138" fill="#ffffff" opacity="0.08"/>
  <path d="M132 604c92-80 188-122 296-126 72-2 126 14 174 50v250H132z" fill="#0f1614" opacity="0.52"/>
  ${coupleSilhouette(272, 430, 1.5)}
  ${floralCorner(112, 102, 1.18)}
  <rect x="764" y="126" width="458" height="648" rx="8" fill="#fffaf2" stroke="#d9cdbd"/>
  <text x="993" y="306" text-anchor="middle" font-family="Georgia, serif" font-size="34" letter-spacing="8" fill="${accent}">${subtitle}</text>
  <text x="993" y="424" text-anchor="middle" font-family="Georgia, serif" font-size="84" fill="#2c2722">Maya</text>
  <text x="993" y="504" text-anchor="middle" font-family="Georgia, serif" font-size="42" letter-spacing="4" fill="#95836d">&amp;</text>
  <text x="993" y="594" text-anchor="middle" font-family="Georgia, serif" font-size="84" fill="#2c2722">Liam</text>
  <line x1="866" y1="650" x2="1120" y2="650" stroke="#d4b06a" stroke-width="2"/>
  <text x="993" y="700" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" letter-spacing="6" fill="#8a7b67">OCTOBER 18 2026</text>
  ${floralCorner(1128, 676, -1.05)}`;

  return spreadShell(title, subtitle, accent, body);
}

function weddingCeremonySpread(
  title: string,
  subtitle: string,
  accent: string,
) {
  const body = `
  ${photoCard(
    82,
    84,
    558,
    704,
    "url(#garden)",
    "THE CEREMONY",
    `<path d="M158 560V170c74-74 150-112 228-114 80-2 154 34 220 108v396z" fill="#fff8ee" opacity="0.18"/>
    <path d="M304 130v440" stroke="#fff8ee" stroke-width="10" opacity="0.36"/>
    <path d="M192 586c42-118 86-190 132-216 46 26 88 98 126 216z" fill="#fffaf0" opacity="0.72"/>
    ${coupleSilhouette(288, 382, 0.78)}`,
  )}
  ${photoCard(
    754,
    92,
    258,
    314,
    "url(#champagne)",
    "RINGS",
    `<circle cx="852" cy="210" r="52" fill="none" stroke="#fffaf0" stroke-width="14" opacity="0.78"/>
    <circle cx="914" cy="236" r="52" fill="none" stroke="#fffaf0" stroke-width="14" opacity="0.7"/>`,
  )}
  ${photoCard(
    1050,
    92,
    258,
    314,
    "url(#rose)",
    "BOUQUET",
    `<circle cx="1134" cy="202" r="34" fill="#fffaf0" opacity="0.74"/>
    <circle cx="1190" cy="190" r="42" fill="#f2d5cc" opacity="0.86"/>
    <circle cx="1232" cy="246" r="32" fill="#b96f68" opacity="0.76"/>
    <path d="M1138 284c72 44 108 82 136 144" stroke="#5c704e" stroke-width="10" stroke-linecap="round"/>`,
  )}
  <text x="1030" y="552" text-anchor="middle" font-family="Georgia, serif" font-size="58" fill="#2c2722">${title}</text>
  <text x="1030" y="604" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" letter-spacing="5" fill="#857763">${subtitle}</text>
  <path d="M796 672h460" stroke="#d4b06a" stroke-width="2"/>
  <text x="1030" y="724" text-anchor="middle" font-family="Georgia, serif" font-size="24" fill="#6b6154">A quiet aisle, soft florals, and the vows.</text>`;

  return spreadShell(title, subtitle, accent, body);
}

function weddingPortraitSpread(
  title: string,
  subtitle: string,
  accent: string,
) {
  const body = `
  <text x="350" y="134" text-anchor="middle" font-family="Georgia, serif" font-size="48" fill="#2c2722">${title}</text>
  <text x="350" y="176" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" letter-spacing="5" fill="#8b7c68">${subtitle}</text>
  ${photoCard(
    96,
    226,
    236,
    506,
    "url(#rose)",
    "VEIL",
    `<path d="M182 322c40 42 60 112 60 244" fill="none" stroke="#fffaf0" stroke-width="18" opacity="0.76"/>
    <circle cx="196" cy="318" r="42" fill="#fffaf0" opacity="0.82"/>`,
  )}
  ${photoCard(
    374,
    226,
    236,
    506,
    "url(#garden)",
    "GARDEN",
    `<path d="M456 592c16-124 54-212 118-262" fill="none" stroke="#fffaf0" stroke-width="16" opacity="0.66"/>
    ${coupleSilhouette(450, 390, 0.72)}`,
  )}
  ${photoCard(
    762,
    88,
    540,
    694,
    "url(#inkPhoto)",
    "NEWLYWEDS",
    `<circle cx="986" cy="266" r="112" fill="#fffaf0" opacity="0.13"/>
    <path d="M846 592c54-120 126-190 218-210 86 18 150 88 198 210z" fill="#fffaf0" opacity="0.24"/>
    ${coupleSilhouette(928, 394, 1.22)}
    <path d="M832 644h392" stroke="#fffaf0" stroke-width="12" opacity="0.32" stroke-linecap="round"/>`,
  )}
  <path d="M662 240v420" stroke="${accent}" stroke-width="2" opacity="0.35"/>
  <text x="662" y="724" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#7a6c59" transform="rotate(-90 662 724)">MAYA &amp; LIAM</text>`;

  return spreadShell(title, subtitle, accent, body);
}

function weddingReceptionSpread(
  title: string,
  subtitle: string,
  accent: string,
) {
  const body = `
  ${photoCard(
    92,
    92,
    544,
    336,
    "url(#champagne)",
    "TABLESCAPE",
    `<rect x="170" y="274" width="392" height="38" rx="19" fill="#fffaf0" opacity="0.78"/>
    <circle cx="222" cy="222" r="28" fill="#fffaf0" opacity="0.72"/>
    <circle cx="306" cy="214" r="28" fill="#fffaf0" opacity="0.62"/>
    <circle cx="390" cy="222" r="28" fill="#fffaf0" opacity="0.72"/>
    <path d="M198 190c80-46 194-50 298-6" fill="none" stroke="#5b4938" stroke-width="10" opacity="0.32"/>`,
  )}
  ${photoCard(
    92,
    486,
    544,
    306,
    "url(#rose)",
    "CAKE",
    `<rect x="260" y="594" width="206" height="88" rx="8" fill="#fffaf0" opacity="0.88"/>
    <rect x="294" y="526" width="138" height="80" rx="8" fill="#fffaf0" opacity="0.82"/>
    <circle cx="312" cy="536" r="18" fill="#d9a197"/>
    <circle cx="404" cy="536" r="18" fill="#d9a197"/>`,
  )}
  <rect x="756" y="90" width="552" height="704" rx="8" fill="url(#inkPhoto)" filter="url(#softShadow)"/>
  <circle cx="1032" cy="264" r="128" fill="#fffaf0" opacity="0.1"/>
  <path d="M832 622c44-116 108-194 190-234 88 38 156 116 204 234z" fill="#fffaf0" opacity="0.2"/>
  ${coupleSilhouette(936, 430, 1.12)}
  <path d="M812 184c92-44 180-66 264-66 70 0 132 14 186 42" fill="none" stroke="#fffaf0" stroke-width="8" stroke-linecap="round" opacity="0.36"/>
  <circle cx="878" cy="170" r="8" fill="#fff6d8"/>
  <circle cx="1008" cy="132" r="8" fill="#fff6d8"/>
  <circle cx="1142" cy="138" r="8" fill="#fff6d8"/>
  <text x="1032" y="694" text-anchor="middle" font-family="Georgia, serif" font-size="52" fill="#fffaf0">${title}</text>
  <text x="1032" y="738" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" letter-spacing="5" fill="#e6d9c5">${subtitle}</text>`;

  return spreadShell(title, subtitle, accent, body);
}
