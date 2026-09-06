import type { Route } from "./+types/robots";
import { cloudflareContext } from "~/lib/context";

export function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /api/",
    "",
    `Sitemap: ${env.SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
