import { Form, data, useFetcher } from "react-router";
import type { Route } from "./+types/skills";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, Input, Select, Button } from "~/components/admin/ui";
import { SKILL_CATEGORIES, type Skill } from "~/lib/types";
import { formBool, int, str } from "~/lib/utils";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { skills: await repo(env).listSkills() };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"));
  const id = str(form.get("id")) || undefined;
  if (intent === "delete" && id) {
    await r.deleteSkill(id);
    return data({ ok: true });
  }
  const name = str(form.get("name"));
  if (!name) return data({ error: "Nombre obligatorio" }, { status: 400 });
  const category = str(form.get("category"), "tools") as Skill["category"];
  await r.saveSkill({
    id,
    name,
    category: SKILL_CATEGORIES.some((c) => c.value === category) ? category : "tools",
    level: Math.min(5, Math.max(1, int(form.get("level"), 3))),
    sort_order: int(form.get("sort_order"), 0),
    visible: id ? formBool(form, "visible") : true,
  });
  return data({ ok: true });
}

export default function Skills({ loaderData }: Route.ComponentProps) {
  const { skills } = loaderData;
  const fetcher = useFetcher();
  const grouped = SKILL_CATEGORIES.map((c) => ({ ...c, items: skills.filter((s) => s.category === c.value) })).filter((g) => g.items.length);
  return (
    <>
      <PageHeader eyebrow="// habilidades" title="Tecnologías y habilidades" description="Se muestran agrupadas por categoría en la sección Habilidades. Nivel 1–5 controla el tamaño en la constelación." />
      <Card title="Agregar" className="mb-6">
        <Form method="post" className="grid gap-3 md:grid-cols-[2fr_1.5fr_1fr_auto] md:items-end">
          <input type="hidden" name="intent" value="save" />
          <div>
            <span className="admin-label">Nombre</span>
            <Input name="name" required placeholder="Cloudflare Workers" />
          </div>
          <div>
            <span className="admin-label">Categoría</span>
            <Select name="category" defaultValue="cloud">
              {SKILL_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <span className="admin-label">Nivel (1–5)</span>
            <Input name="level" type="number" min={1} max={5} defaultValue={4} />
          </div>
          <Button type="submit">Agregar</Button>
        </Form>
      </Card>
      {grouped.map((g) => (
        <Card key={g.value} title={g.label} className="mb-4">
          <ul className="divide-y divide-line">
            {g.items.map((s) => (
              <li key={s.id} className="py-2">
                <fetcher.Form method="post" className="grid items-center gap-2 md:grid-cols-[2fr_1.5fr_80px_80px_auto_auto]">
                  <input type="hidden" name="intent" value="save" />
                  <input type="hidden" name="id" value={s.id} />
                  <Input name="name" defaultValue={s.name} />
                  <Select name="category" defaultValue={s.category}>
                    {SKILL_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                  <Input name="level" type="number" min={1} max={5} defaultValue={s.level} title="Nivel" />
                  <Input name="sort_order" type="number" defaultValue={s.sort_order} title="Orden" />
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input type="hidden" name="visible" value="0" />
                    <input type="checkbox" name="visible" value="1" defaultChecked={s.visible} className="admin-checkbox" /> visible
                  </label>
                  <div className="flex gap-1">
                    <button className="admin-btn admin-btn-outline admin-btn-sm">Guardar</button>
                    <button
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      name="intent"
                      value="delete"
                      onClick={(e) => {
                        if (!confirm(`¿Eliminar «${s.name}»?`)) e.preventDefault();
                      }}
                    >
                      ×
                    </button>
                  </div>
                </fetcher.Form>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </>
  );
}
