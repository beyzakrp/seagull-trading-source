import { getBucket } from "../../../../storage/r2";

// Public, unauthenticated on purpose — these are menu-item photos shown on
// the public /menu/[slug] page, same trust level as the menu itself. Each
// upload gets a fresh key (see business-actions.ts uploadItemImageAction),
// so aggressive immutable caching is safe.
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const bucket = await getBucket();
  const object = await bucket.get(key.join("/"));

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: object.httpEtag,
    },
  });
}
