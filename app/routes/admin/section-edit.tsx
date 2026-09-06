import { Form, data, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/section-edit";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, Field, Input, Toggle, Button, Notice, LinkButton } from "~/components/admin/ui";
import { SectionContentFields } from "~/components/admin/SectionContentFields";
import { parseContentForm } from "~/lib/sections";
import { SECTION_TYPES } from "~/lib/types";
import { formBool, int, nullable, str } from "~/lib/utils";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const section = await repo(env).getSection(params.id);
  if (!section) throw data("Sección no encontrada", { status: 404 });
  return { section };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const section = await r.getSection(params.id);
  if (!section) throw data("Sección no encontrada", { status: 404 });
  const form = await request.formData();
  const intent = str(form.get("intent"), "save");
  if (intent === "delete") {
    await r.deleteSection(section.id);
    return redirect("/admin/secciones");
  }
  try {
    const content = parseContentForm(section.type, form, section.content);
    await r.updateSection(section.id, {
      eyebrow: nullable(form.get("eyebrow")),
      title: nullable(form.get("title")),
      subtitle: nullable(form.get("subtitle")),
      sort_order: int(form.get("sort_order"), section.sort_order),
      visible: formBool(form, "visible"),
      content,
    });
    return data({ ok: true, error: null });
  } catch (e) {
    return data({ ok: false, error: e instanceof Error ? e.message : "No se pudo guardar" }, { status: 400 });
  }
}

export default function SectionEdit({ loaderData, actionData }: Route.ComponentProps) {
  const { section } = loaderData;
  const nav = useNavigation();
  const busy = nav.state === "submitting";
  const typeMeta = SECTION_TYPES.find((t) => t.value === section.type);
  return (
    <>
      <PageHeader
        eyebrow={`// sección · ${section.type}`}
        title={section.title || typeMeta?.label || "Sección"}
        description={typeMeta?.description}
        actions={
          <>
            <LinkButton to="/admin/secciones">← Volver</LinkButton>
            <a href={`/#${section.id}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline">
              Ver en el sitio ↗
            </a>
          </>
        }
      />
      {actionData?.ok && <Notice kind="success">Sección guardada.</Notice>}
      {actionData?.error && <Notice kind="error">{actionData.error}</Notice>}
      <Form method="post" className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" key={section.updated_at}>
        <div className="flex flex-col gap-6">
          <Card title="Encabezado">
            <div className="grid gap-4">
              <Field label="Etiqueta pequeña (eyebrow)" help="Texto monoespaciado sobre el título, p. ej. «01 — Sobre mí».">
                <Input name="eyebrow" defaultValue={section.eyebrow ?? ""} />
              </Field>
              <Field label="Título">
                <Input name="title" defaultValue={section.title ?? ""} />
              </Field>
              <Field label="Subtítulo">
                <Input name="subtitle" defaultValue={section.subtitle ?? ""} />
              </Field>
            </div>
          </Card>
          <Card>
            <SectionContentFields type={section.type} content={section.content} />
          </Card>
        </div>
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Publicación">
            <div className="flex flex-col gap-4">
              <Toggle name="visible" label="Visible en el sitio" defaultChecked={section.visible} />
              <Field label="Orden" help="Número menor = más arriba. También puedes reordenar en la lista.">
                <Input name="sort_order" type="number" defaultValue={section.sort_order} />
              </Field>
              <p className="font-mono text-[11px] text-muted">
                id: {section.id}
                <br />
                ancla: #{section.id}
              </p>
              <Button type="submit" name="intent" value="save" disabled={busy}>
                {busy ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </Card>
          <Card title="Zona de peligro">
            <Button
              type="submit"
              name="intent"
              value="delete"
              variant="danger"
              onClick={(e) => {
                if (!confirm("¿Eliminar esta sección?")) e.preventDefault();
              }}
            >
              Eliminar sección
            </Button>
          </Card>
        </aside>
      </Form>
    </>
  );
}
