import { Link, data, useFetcher } from "react-router";
import type { Route } from "./+types/projects";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Badge, LinkButton, EmptyState } from "~/components/admin/ui";
import { useAdmin } from "~/components/admin/context";
import { imageUrl } from "~/lib/cloudinary";
import { cx, str } from "~/lib/utils";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { projects: await repo(env).listProjects() };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"));
  const id = str(form.get("id"));
  const p = id ? await r.getProject(id) : null;
  if (!p) return data({ error: "Proyecto no encontrado" }, { status: 404 });
  if (intent === "toggle-visible") await r.saveProject({ ...p, visible: !p.visible });
  else if (intent === "toggle-featured") await r.saveProject({ ...p, featured: !p.featured });
  else if (intent === "delete") await r.deleteProject(id);
  else if (intent === "move") {
    const dir = str(form.get("dir")) === "up" ? -1 : 1;
    const list = await r.listProjects();
    const idx = list.findIndex((x) => x.id === id);
    const j = idx + dir;
    if (idx !== -1 && j >= 0 && j < list.length) {
      const ids = list.map((x) => x.id);
      [ids[idx], ids[j]] = [ids[j], ids[idx]];
      await r.reorderProjects(ids);
    }
  }
  return data({ ok: true });
}

const STATUS: Record<string, { label: string; tone: "success" | "warn" | "neutral" | "accent" }> = {
  live: { label: "en línea", tone: "success" },
  building: { label: "en construcción", tone: "warn" },
  archived: { label: "archivado", tone: "neutral" },
  concept: { label: "concepto", tone: "accent" },
};

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { projects } = loaderData;
  const { cloudName } = useAdmin();
  const fetcher = useFetcher();
  return (
    <>
      <PageHeader
        eyebrow="// proyectos"
        title="Proyectos"
        description="Aparecen en el riel de la página principal y en /proyectos/slug."
        actions={
          <LinkButton to="/admin/proyectos/new" variant="primary">
            + Nuevo proyecto
          </LinkButton>
        }
      />
      {projects.length === 0 ? (
        <EmptyState title="Sin proyectos" description="Crea el primero." action={<LinkButton to="/admin/proyectos/new" variant="primary">+ Nuevo proyecto</LinkButton>} />
      ) : (
        <ol className="flex flex-col gap-2">
          {projects.map((p, i) => (
            <li key={p.id} className={cx("admin-card flex flex-wrap items-center gap-4 py-3", !p.visible && "opacity-60")}>
              <span className="w-6 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-ink-3">
                {p.cover_image ? (
                  <img src={imageUrl(p.cover_image, cloudName, { w: 240, h: 168, crop: "fill" })} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full" style={{ background: p.accent ?? "#222" }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/admin/proyectos/${p.id}`} className="font-display text-base font-semibold hover:text-accent">
                    {p.title}
                  </Link>
                  <Badge tone={STATUS[p.status]?.tone ?? "neutral"}>{STATUS[p.status]?.label ?? p.status}</Badge>
                  {p.featured && <Badge tone="accent">destacado</Badge>}
                  {!p.visible && <Badge tone="warn">oculto</Badge>}
                </div>
                <p className="truncate text-xs text-muted">
                  /proyectos/{p.slug} · {p.year ?? "s/f"} · {p.tagline ?? ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === 0}>↑</button>
                </fetcher.Form>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === projects.length - 1}>↓</button>
                </fetcher.Form>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="toggle-featured" />
                  <input type="hidden" name="id" value={p.id} />
                  <button className="admin-btn admin-btn-outline admin-btn-sm">{p.featured ? "Quitar destacado" : "Destacar"}</button>
                </fetcher.Form>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="toggle-visible" />
                  <input type="hidden" name="id" value={p.id} />
                  <button className="admin-btn admin-btn-outline admin-btn-sm">{p.visible ? "Ocultar" : "Mostrar"}</button>
                </fetcher.Form>
                <Link to={`/admin/proyectos/${p.id}`} className="admin-btn admin-btn-outline admin-btn-sm">Editar</Link>
                <fetcher.Form
                  method="post"
                  onSubmit={(e) => {
                    if (!confirm(`¿Eliminar «${p.title}»?`)) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={p.id} />
                  <button className="admin-btn admin-btn-danger admin-btn-sm">Borrar</button>
                </fetcher.Form>
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
