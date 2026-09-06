import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, LinkButton } from "~/components/admin/ui";
import { formatDate } from "~/lib/utils";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const [counts, messages, sections, projects] = await Promise.all([
    r.counts(),
    r.listMessages(5),
    r.listSections(),
    r.listProjects(),
  ]);
  return { counts, messages, sections, projects, siteUrl: env.SITE_URL };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { counts, messages, sections, projects, siteUrl } = loaderData;
  const hidden = sections.filter((s) => !s.visible).length;
  const stats = [
    { label: "Secciones", value: counts.sections, note: hidden ? `${hidden} oculta(s)` : "todas visibles", to: "/admin/secciones" },
    { label: "Proyectos", value: counts.projects, note: `${projects.filter((p) => p.featured).length} destacados`, to: "/admin/proyectos" },
    { label: "Trayectoria", value: counts.experiences, note: "entradas", to: "/admin/experiencia" },
    { label: "Habilidades", value: counts.skills, note: "tecnologías", to: "/admin/habilidades" },
    { label: "Media", value: counts.media, note: "imágenes en Cloudinary", to: "/admin/media" },
    { label: "Mensajes", value: counts.messages, note: counts.unread ? `${counts.unread} sin leer` : "al día", to: "/admin/mensajes" },
  ];
  return (
    <>
      <PageHeader
        eyebrow="// resumen"
        title="Todo bajo control"
        description={`Este panel edita el contenido de ${siteUrl.replace("https://", "")}. Los cambios se publican al instante.`}
        actions={
          <>
            <LinkButton to="/admin/proyectos/new" variant="primary">
              + Nuevo proyecto
            </LinkButton>
            <LinkButton to="/admin/secciones">Ordenar secciones</LinkButton>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="admin-card group transition hover:border-paper/30">
            <p className="admin-eyebrow">{s.label}</p>
            <p className="font-display text-4xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.note}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Últimos mensajes" description="Formulario de contacto del sitio.">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">Nadie ha escrito todavía.</p>
          ) : (
            <ul className="divide-y divide-line">
              {messages.map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {!m.read && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />}
                      {m.name} <span className="text-muted">· {m.email}</span>
                    </p>
                    <span className="font-mono text-[10px] text-muted">{formatDate(m.created_at)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{m.body}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <LinkButton to="/admin/mensajes" size="sm">
              Ver todos
            </LinkButton>
          </div>
        </Card>
        <Card title="Cómo funciona" description="Guía rápida del panel.">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>
              <strong className="text-paper">Secciones</strong> arma la página principal: reordena, oculta o agrega bloques (hero, texto, galería, cifras…).
            </li>
            <li>
              <strong className="text-paper">Proyectos</strong> alimenta el riel de proyectos y las páginas de detalle en <code>/proyectos/slug</code>.
            </li>
            <li>
              <strong className="text-paper">Media</strong> sube imágenes a Cloudinary; luego elígelas desde cualquier campo de imagen.
            </li>
            <li>
              <strong className="text-paper">Ajustes</strong> controla nombre, bio, redes, SEO y colores de acento.
            </li>
          </ol>
        </Card>
      </div>
    </>
  );
}
