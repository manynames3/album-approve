import { readStoredAsset, verifyAssetSignature } from "@/server/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key } = await context.params;
  const storageKey = key.join("/");
  const url = new URL(request.url);

  if (
    !verifyAssetSignature(
      storageKey,
      url.searchParams.get("expires"),
      url.searchParams.get("signature"),
    )
  ) {
    return new Response("Asset signature is invalid or expired.", {
      status: 403,
    });
  }

  try {
    const asset = await readStoredAsset(storageKey);

    return new Response(asset.bytes, {
      headers: {
        "Content-Type": asset.contentType,
        "Content-Length": String(asset.size),
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new Response("Asset not found.", { status: 404 });
  }
}
