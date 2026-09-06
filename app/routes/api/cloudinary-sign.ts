import { data } from "react-router";
import type { Route } from "./+types/cloudinary-sign";
import { cloudflareContext } from "~/lib/context";
import { isAuthenticated } from "~/lib/auth.server";
import { signUploadParams, UPLOAD_FOLDER } from "~/lib/cloudinary.server";

/**
 * Returns signed parameters so the admin browser can upload directly to Cloudinary
 * without ever seeing the API secret.
 */
export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  if (!(await isAuthenticated(request, env))) return data({ error: "No autorizado" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { folder?: string; public_id?: string; tags?: string };
  const folder = body.folder && /^[a-z0-9_/-]+$/i.test(body.folder) ? body.folder : UPLOAD_FOLDER;
  const signed = await signUploadParams(env, {
    folder,
    public_id: body.public_id,
    tags: body.tags,
  });
  return data({
    ...signed,
    upload_url: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
  });
}

export function loader() {
  return data({ error: "Usa POST" }, { status: 405 });
}
