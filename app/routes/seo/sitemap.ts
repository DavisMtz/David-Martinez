import type { Route } from "./+types/sitemap";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const projects = await repo(env).listProjects({ visibleOnly: true });
  const urls = [
    { loc: `${env.SITE_URL}/`, priority: "1.0", lastmod: new Date().toISOString() },
    ...projects.map((p) => ({
      loc: `${env.SITE_URL}/proyectos/${p.slug}`,
      priority: "0.8",
      lastmod: p.updated_at || new Date().toISOString(),
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
