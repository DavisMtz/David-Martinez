import { Form, Link, data, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/sections";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, Badge, Button, Select, EmptyState } from "~/components/admin/ui";
import { SECTION_TYPES, type SectionType } from "~/lib/types";
import { sectionDefaults } from "~/lib/sections";
import { cx, str } from "~/lib/utils";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { sections: await repo(env).listSections() };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"));
  const id = str(form.get("id"));

  if (intent === "create") {
    const type = str(form.get("type")) as SectionType;
    const label = SECTION_TYPES.find((t) => t.value === type);
    if (!label) return data({ error: "Tipo inválido" }, { status: 400 });
    const created = await r.createSection({ type, title: label.label, content: sectionDefaults(type) });
    return redirect(`/admin/secciones/${created.id}`);
  }
  if (intent === "toggle" && id) {
    const s = await r.getSection(id);
    if (s) await r.updateSection(id, { visible: !s.visible });
    return data({ ok: true });
  }
  if (intent === "move" && id) {
    const dir = str(form.get("dir")) === "up" ? -1 : 1;
    const list = await r.listSections();
    const idx = list.findIndex((s) => s.id === id);
    const j = idx + dir;
    if (idx === -1 || j < 0 || j >= list.length) return data({ ok: true });
    const ids = list.map((s) => s.id);
    [ids[idx], ids[j]] = [ids[j], ids[idx]];
    await r.reorderSections(ids);
    return data({ ok: true });
  }
  if (intent === "delete" && id) {
    await r.deleteSection(id);
    return data({ ok: true });
  }
  return data({ error: "Acción desconocida" }, { status: 400 });
}

export default function Sections({ loaderData }: Route.ComponentProps) {
  const { sections } = loaderData;
  const fetcher = useFetcher();
  return (
    <>
      <PageHeader
        eyebrow="// secciones"
        title="Estructura de la página"
        description="El orden de esta lista es el orden en la página principal. Cada sección se puede ocultar sin borrarla."
      />
      <Card className="mb-6" title="Agregar sección">
        <Form method="post" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="intent" value="create" />
          <div className="min-w-64 flex-1">
            <span className="admin-label">Tipo</span>
            <Select name="type" defaultValue="text">
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label} — {t.description}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit">Crear</Button>
        </Form>
      </Card>

      {sections.length === 0 ? (
        <EmptyState title="No hay secciones" description="Crea la primera con el formulario de arriba." />
      ) : (
        <ol className="flex flex-col gap-2">
          {sections.map((s, i) => {
            const typeMeta = SECTION_TYPES.find((t) => t.value === s.type);
            return (
              <li key={s.id} className={cx("admin-card flex flex-wrap items-center gap-3 py-3", !s.visible && "opacity-60")}>
                <span className="font-mono text-xs text-muted w-6">{String(i + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/secciones/${s.id}`} className="font-display text-base font-semibold hover:text-accent">
                      {s.title || typeMeta?.label || s.type}
                    </Link>
                    <Badge tone="accent">{s.type}</Badge>
                    {!s.visible && <Badge tone="warn">oculta</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted">{s.subtitle || typeMeta?.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="move" />
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === 0} title="Subir">
                      ↑
                    </button>
                  </fetcher.Form>
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="move" />
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" disabled={i === sections.length - 1} title="Bajar">
                      ↓
                    </button>
                  </fetcher.Form>
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="id" value={s.id} />
                    <button className="admin-btn admin-btn-outline admin-btn-sm">{s.visible ? "Ocultar" : "Mostrar"}</button>
                  </fetcher.Form>
                  <Link to={`/admin/secciones/${s.id}`} className="admin-btn admin-btn-outline admin-btn-sm">
                    Editar
                  </Link>
                  <fetcher.Form
                    method="post"
                    onSubmit={(e) => {
                      if (!confirm("¿Eliminar esta sección? Esta acción no se puede deshacer.")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={s.id} />
                    <button className="admin-btn admin-btn-danger admin-btn-sm">Borrar</button>
                  </fetcher.Form>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
