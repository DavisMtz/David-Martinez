import { Link, data, useFetcher } from "react-router";
import type { Route } from "./+types/experience";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Badge, LinkButton, EmptyState } from "~/components/admin/ui";
import { cx, formatPeriod, str } from "~/lib/utils";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { items: await repo(env).listExperiences() };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"));
  const id = str(form.get("id"));
  const e = id ? await r.getExperience(id) : null;
  if (!e) return data({ error: "No encontrado" }, { status: 404 });
  if (intent === "toggle") await r.saveExperience({ ...e, visible: !e.visible });
  else if (intent === "delete") await r.deleteExperience(id);
  else if (intent === "move") {
    const dir = str(form.get("dir")) === "up" ? -1 : 1;
    const list = await r.listExperiences();
    const idx = list.findIndex((x) => x.id === id);
    const j = idx + dir;
    if (idx !== -1 && j >= 0 && j < list.length) {
      const ids = list.map((x) => x.id);
      [ids[idx], ids[j]] = [ids[j], ids[idx]];
      await r.reorderExperiences(ids);
    }
  }
  return data({ ok: true });
}

const KIND: Record<string, string> = { work: "trabajo", education: "formación", award: "reconocimiento", community: "comunidad" };

export default function ExperienceList({ loaderData }: Route.ComponentProps) {
  const { items } = loaderData;
  const fetcher = useFetcher();
  return (
    <>
      <PageHeader
        eyebrow="// trayectoria"
        title="Experiencia y formación"
        description="Línea de tiempo de la sección Trayectoria."
        actions={
          <LinkButton to="/admin/experiencia/new" variant="primary">
            + Nueva entrada
          </LinkButton>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="Sin entradas" description="Agrega tu primer puesto, proyecto o estudio." />
      ) : (
        <ol className="flex flex-col gap-2">
          {items.map((e, i) => (
            <li key={e.id} className={cx("admin-card flex flex-wrap items-center gap-4 py-3", !e.visible && "opacity-60")}>
              <span className="w-6 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/admin/experiencia/${e.id}`} className="font-display text-base font-semibold hover:text-accent">
                    {e.role} · {e.organization}
                  </Link>
                  <Badge tone="accent">{KIND[e.kind] ?? e.kind}</Badge>
                  {!e.visible && <Badge tone="warn">oculta</Badge>}
                </div>
                <p className="text-xs text-muted">
                  {formatPeriod(e.start_date, e.end_date)} {e.location ? `· ${e.location}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === 0}>↑</button>
                </fetcher.Form>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="move" />
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === items.length - 1}>↓</button>
                </fetcher.Form>
                <fetcher.Form method="post">
                  <input type="hidden" name="intent" value="toggle" />
                  <input type="hidden" name="id" value={e.id} />
                  <button className="admin-btn admin-btn-outline admin-btn-sm">{e.visible ? "Ocultar" : "Mostrar"}</button>
                </fetcher.Form>
                <Link to={`/admin/experiencia/${e.id}`} className="admin-btn admin-btn-outline admin-btn-sm">Editar</Link>
                <fetcher.Form
                  method="post"
                  onSubmit={(ev) => {
                    if (!confirm("¿Eliminar esta entrada?")) ev.preventDefault();
                  }}
                >
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={e.id} />
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
