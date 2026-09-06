import { Form, data, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/experience-edit";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, Field, Input, Textarea, Select, Toggle, Button, Notice, LinkButton } from "~/components/admin/ui";
import type { Experience } from "~/lib/types";
import { formBool, int, nullable, parseList, str } from "~/lib/utils";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  if (params.id === "new") return { item: null };
  const item = await repo(env).getExperience(params.id);
  if (!item) throw data("No encontrado", { status: 404 });
  return { item };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"), "save");
  const existing = params.id === "new" ? null : await r.getExperience(params.id);
  if (intent === "delete" && existing) {
    await r.deleteExperience(existing.id);
    return redirect("/admin/experiencia");
  }
  const organization = str(form.get("organization"));
  const role = str(form.get("role"));
  if (!organization || !role) return data({ ok: false, error: "Organización y rol son obligatorios." }, { status: 400 });
  const kind = str(form.get("kind"), "work") as Experience["kind"];
  const saved = await r.saveExperience({
    id: existing?.id,
    kind: ["work", "education", "award", "community"].includes(kind) ? kind : "work",
    organization,
    role,
    location: nullable(form.get("location")),
    start_date: nullable(form.get("start_date")),
    end_date: nullable(form.get("end_date")),
    description: nullable(form.get("description")),
    highlights: parseList(form.get("highlights")),
    url: nullable(form.get("url")),
    visible: formBool(form, "visible"),
    sort_order: existing ? int(form.get("sort_order"), existing.sort_order) : undefined,
  });
  if (!existing) return redirect(`/admin/experiencia/${saved.id}`);
  return data({ ok: true, error: null });
}

export default function ExperienceEdit({ loaderData, actionData }: Route.ComponentProps) {
  const e = loaderData.item;
  const nav = useNavigation();
  const busy = nav.state === "submitting";
  return (
    <>
      <PageHeader
        eyebrow={e ? "// trayectoria" : "// nueva entrada"}
        title={e ? `${e.role} · ${e.organization}` : "Nueva entrada"}
        actions={<LinkButton to="/admin/experiencia">← Volver</LinkButton>}
      />
      {actionData?.ok && <Notice kind="success">Guardado.</Notice>}
      {actionData?.error && <Notice kind="error">{actionData.error}</Notice>}
      <Form method="post" className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" key={e?.updated_at ?? "new"}>
        <div className="flex flex-col gap-6">
          <Card title="Datos">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tipo">
                <Select name="kind" defaultValue={e?.kind ?? "work"}>
                  <option value="work">Trabajo</option>
                  <option value="education">Formación</option>
                  <option value="award">Reconocimiento</option>
                  <option value="community">Comunidad</option>
                </Select>
              </Field>
              <Field label="Ubicación">
                <Input name="location" defaultValue={e?.location ?? ""} />
              </Field>
              <Field label="Rol / título">
                <Input name="role" defaultValue={e?.role ?? ""} required />
              </Field>
              <Field label="Organización">
                <Input name="organization" defaultValue={e?.organization ?? ""} required />
              </Field>
              <Field label="Inicio" help="Formato AAAA o AAAA-MM.">
                <Input name="start_date" defaultValue={e?.start_date ?? ""} placeholder="2024-03" className="font-mono" />
              </Field>
              <Field label="Fin" help="Vacío = actualidad.">
                <Input name="end_date" defaultValue={e?.end_date ?? ""} placeholder="" className="font-mono" />
              </Field>
              <Field label="URL" className="md:col-span-2">
                <Input name="url" defaultValue={e?.url ?? ""} placeholder="https://…" />
              </Field>
              <Field label="Descripción (Markdown)" className="md:col-span-2">
                <Textarea name="description" defaultValue={e?.description ?? ""} />
              </Field>
              <Field label="Logros" className="md:col-span-2" help="Uno por línea.">
                <Textarea name="highlights" defaultValue={e?.highlights.join("\n") ?? ""} className="font-mono text-sm" />
              </Field>
            </div>
          </Card>
        </div>
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Publicación">
            <div className="flex flex-col gap-4">
              <Toggle name="visible" label="Visible" defaultChecked={e?.visible ?? true} />
              {e && (
                <Field label="Orden">
                  <Input name="sort_order" type="number" defaultValue={e.sort_order} />
                </Field>
              )}
              <Button type="submit" name="intent" value="save" disabled={busy}>
                {busy ? "Guardando…" : e ? "Guardar" : "Crear"}
              </Button>
            </div>
          </Card>
          {e && (
            <Card title="Zona de peligro">
              <Button type="submit" name="intent" value="delete" variant="danger" onClick={(ev) => { if (!confirm("¿Eliminar?")) ev.preventDefault(); }}>
                Eliminar entrada
              </Button>
            </Card>
          )}
        </aside>
      </Form>
    </>
  );
}
