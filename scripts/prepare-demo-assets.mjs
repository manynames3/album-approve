import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Next.js already ships sharp; do not add another production image dependency.
const sharp = require(
  require.resolve("sharp", {
    paths: [path.dirname(require.resolve("next/package.json"))],
  }),
);
const root = fileURLToPath(new URL("../", import.meta.url));
const catalogPath = path.join(root, "src/lib/demo-album-assets.json");
const assets = JSON.parse(await readFile(catalogPath, "utf8"));
const outputDir = path.join(root, "public/demo/maya-liam");
await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  const input = path.join(root, "assets/demo/maya-liam", asset.name + ".png");
  const source = await readFile(input);
  const full = await sharp(source).webp({ quality: 90, effort: 5 }).toBuffer();
  const thumb = await sharp(source)
    .resize({ width: 320, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toBuffer();
  const { width, height } = await sharp(full).metadata();
  await writeFile(path.join(outputDir, asset.name + ".webp"), full);
  await writeFile(path.join(outputDir, asset.name + "-thumb.webp"), thumb);
  Object.assign(asset, { width, height, sizeBytes: full.byteLength });
  console.log(
    asset.name +
      ": " +
      full.byteLength +
      " bytes, thumbnail " +
      thumb.byteLength +
      " bytes",
  );
}
await writeFile(catalogPath, JSON.stringify(assets, null, 2) + "\n");
