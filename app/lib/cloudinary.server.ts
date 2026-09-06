/** Server-side Cloudinary helpers: signed upload params and Admin API calls. */

async function sha1Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Cloudinary signature: SHA-1 of the sorted `key=value` pairs joined with `&`,
 * followed by the API secret. `file`, `cloud_name`, `resource_type` and `api_key`
 * are never part of the signature.
 */
export async function signUploadParams(
  env: Env,
  params: Record<string, string | number | undefined>,
): Promise<{ signature: string; timestamp: number; api_key: string; cloud_name: string; params: Record<string, string> }> {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign: Record<string, string> = { timestamp: String(timestamp) };
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (["file", "cloud_name", "resource_type", "api_key"].includes(k)) continue;
    toSign[k] = String(v);
  }
  const serialized = Object.keys(toSign)
    .sort()
    .map((k) => `${k}=${toSign[k]}`)
    .join("&");
  const signature = await sha1Hex(serialized + env.CLOUDINARY_API_SECRET);
  return { signature, timestamp, api_key: env.CLOUDINARY_API_KEY, cloud_name: env.CLOUDINARY_CLOUD_NAME, params: toSign };
}

function adminAuth(env: Env): string {
  return "Basic " + btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
}

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
  created_at: string;
  tags?: string[];
}

export async function listResources(env: Env, prefix: string, maxResults = 200): Promise<CloudinaryResource[]> {
  const out: CloudinaryResource[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/image/upload`);
    url.searchParams.set("prefix", prefix);
    url.searchParams.set("max_results", String(Math.min(maxResults, 500)));
    url.searchParams.set("tags", "true");
    if (cursor) url.searchParams.set("next_cursor", cursor);
    const res = await fetch(url, { headers: { Authorization: adminAuth(env) } });
    if (!res.ok) throw new Error(`Cloudinary list failed: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as { resources: CloudinaryResource[]; next_cursor?: string };
    out.push(...data.resources);
    cursor = data.next_cursor;
  } while (cursor && out.length < maxResults);
  return out;
}

export async function destroyResource(env: Env, publicId: string, resourceType = "image"): Promise<boolean> {
  const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/${resourceType}/upload`;
  const body = new URLSearchParams();
  body.append("public_ids[]", publicId);
  const res = await fetch(url, { method: "DELETE", headers: { Authorization: adminAuth(env) }, body });
  return res.ok;
}

export const UPLOAD_FOLDER = "portfolio";
