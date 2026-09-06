import type { Route } from "./+types/home";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { buildMeta, personJsonLd } from "~/lib/seo";
import { SectionRenderer } from "~/components/site/sections";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [];
  return buildMeta({ settings: loaderData.settings, siteUrl: loaderData.siteUrl, cloudName: loaderData.cloudName, path: "/" });
}

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const [settings, sections] = await Promise.all([r.getSettings(), r.listSections(true)]);
  const types = new Set(sections.map((s) => s.type));
  const [projects, experiences, skills] = await Promise.all([
    types.has("projects") ? r.listProjects({ visibleOnly: true }) : Promise.resolve([]),
    types.has("experience") ? r.listExperiences(true) : Promise.resolve([]),
    types.has("skills") ? r.listSkills(true) : Promise.resolve([]),
  ]);
  return { settings, sections, projects, experiences, skills, siteUrl: env.SITE_URL, cloudName: env.CLOUDINARY_CLOUD_NAME };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { settings, sections, projects, experiences, skills, siteUrl, cloudName } = loaderData;
  const data = { projects, experiences, skills };
  let counter = 0;
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(settings, siteUrl, cloudName)) }} />
      {sections.map((section) => {
        const numbered = !["hero", "marquee"].includes(section.type);
        if (numbered) counter += 1;
        return <SectionRenderer key={section.id} section={section} index={counter} data={data} />;
      })}
      {sections.length === 0 && (
        <section className="grid min-h-[100svh] place-items-center px-6 text-center">
          <div>
            <p className="eyebrow">// sitio en construcción</p>
            <h1 className="display-lg mt-4">{settings.name}</h1>
            <p className="mt-4 text-muted">Agrega secciones desde el panel de administración.</p>
          </div>
        </section>
      )}
    </main>
  );
}
