import { Form, data, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/project-edit";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, Field, Input, Textarea, Select, Toggle, Button, Notice, LinkButton } from "~/components/admin/ui";
import { ImagePicker } from "~/components/admin/ImagePicker";
import { ObjectsEditor } from "~/components/admin/ObjectsEditor";
import type { Project } from "~/lib/types";
import { formBool, int, nullable, parseList, slugify, str } from "~/lib/utils";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  if (params.id === "new") return { project: null };
  const project = await repo(env).getProject(params.id);
  if (!project) throw data("Proyecto no encontrado", { status: 404 });
  return { project };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"), "save");
  const existing = params.id === "new" ? null : await r.getProject(params.id);

  if (intent === "delete" && existing) {
    await r.deleteProject(existing.id);
    return redirect("/admin/proyectos");
  }

  const title = str(form.get("title"));
  if (!title) return data({ ok: false, error: "El título es obligatorio." }, { status: 400 });
  const slug = slugify(str(form.get("slug")) || title);
  if (!slug) return data({ ok: false, error: "El slug no es válido." }, { status: 400 });
  const other = await r.getProjectBySlug(slug);
  if (other && other.id !== existing?.id) return data({ ok: false, error: `El slug «${slug}» ya está en uso.` }, { status: 400 });

  let gallery: string[] = [];
  try {
    gallery = (JSON.parse(String(form.get("gallery") ?? "[]")) as { image?: string }[]).map((g) => g.image ?? "").filter(Boolean);
  } catch {
    gallery = existing?.gallery ?? [];
  }
  const status = str(form.get("status"), "live") as Project["status"];
  const input: Partial<Project> & { title: string; slug: string } = {
    id: existing?.id,
    title,
    slug,
    tagline: nullable(form.get("tagline")),
    description: nullable(form.get("description")),
    role: nullable(form.get("role")),
    year: nullable(form.get("year")),
    status: ["live", "building", "archived", "concept"].includes(status) ? status : "live",
    url: nullable(form.get("url")),
    repo_url: nullable(form.get("repo_url")),
    tags: parseList(form.get("tags")),
    stack: parseList(form.get("stack")),
    cover_image: nullable(form.get("cover_image")),
    gallery,
    accent: nullable(form.get("accent")),
    featured: formBool(form, "featured"),
    visible: formBool(form, "visible"),
    sort_order: existing ? int(form.get("sort_order"), existing.sort_order) : undefined,
  };
  const saved = await r.saveProject(input);
  if (!existing) return redirect(`/admin/proyectos/${saved.id}`);
  return data({ ok: true, error: null });
}

export default function ProjectEdit({ loaderData, actionData }: Route.ComponentProps) {
  const p = loaderData.project;
  const nav = useNavigation();
  const busy = nav.state === "submitting";
  return (
    <>
      <PageHeader
        eyebrow={p ? "// proyecto" : "// nuevo proyecto"}
        title={p?.title ?? "Nuevo proyecto"}
        description={p ? `/proyectos/${p.slug}` : "Completa los datos y guarda."}
        actions={
          <>
            <LinkButton to="/admin/proyectos">← Volver</LinkButton>
            {p && (
              <a href={`/proyectos/${p.slug}`} target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline">
                Ver página ↗
              </a>
            )}
          </>
        }
      />
      {actionData?.ok && <Notice kind="success">Proyecto guardado.</Notice>}
      {actionData?.error && <Notice kind="error">{actionData.error}</Notice>}
      <Form method="post" className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" key={p?.updated_at ?? "new"}>
        <div className="flex flex-col gap-6">
          <Card title="Básicos">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Título" className="md:col-span-2">
                <Input name="title" defaultValue={p?.title ?? ""} required />
              </Field>
              <Field label="Slug (URL)" help="Se genera del título si lo dejas vacío.">
                <Input name="slug" defaultValue={p?.slug ?? ""} className="font-mono" />
              </Field>
              <Field label="Año">
                <Input name="year" defaultValue={p?.year ?? ""} placeholder="2026" />
              </Field>
              <Field label="Tagline" className="md:col-span-2" help="Una frase que resume el producto.">
                <Input name="tagline" defaultValue={p?.tagline ?? ""} />
              </Field>
              <Field label="Mi rol">
                <Input name="role" defaultValue={p?.role ?? ""} placeholder="Diseño, desarrollo, producto" />
              </Field>
              <Field label="Estado">
                <Select name="status" defaultValue={p?.status ?? "live"}>
                  <option value="live">En línea</option>
                  <option value="building">En construcción</option>
                  <option value="concept">Concepto</option>
                  <option value="archived">Archivado</option>
                </Select>
              </Field>
              <Field label="URL del proyecto">
                <Input name="url" defaultValue={p?.url ?? ""} placeholder="https://…" />
              </Field>
              <Field label="Repositorio (opcional)">
                <Input name="repo_url" defaultValue={p?.repo_url ?? ""} placeholder="https://github.com/…" />
              </Field>
            </div>
          </Card>
          <Card title="Historia" description="Markdown. Cuenta el problema, la solución y lo que aprendiste.">
            <Textarea name="description" defaultValue={p?.description ?? ""} className="min-h-72 font-mono text-sm" />
          </Card>
          <Card title="Etiquetas y stack">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Etiquetas" help="Una por línea o separadas por coma (p. ej. Producto, Comercio local).">
                <Textarea name="tags" defaultValue={p?.tags.join("\n") ?? ""} className="font-mono text-sm" />
              </Field>
              <Field label="Stack" help="Tecnologías, una por línea.">
                <Textarea name="stack" defaultValue={p?.stack.join("\n") ?? ""} className="font-mono text-sm" />
              </Field>
            </div>
          </Card>
          <Card title="Imágenes">
            <div className="flex flex-col gap-6">
              <ImagePicker name="cover_image" value={p?.cover_image} label="Portada" />
              <ObjectsEditor
                name="gallery"
                label="Galería"
                value={(p?.gallery ?? []).map((image) => ({ image }))}
                fields={[{ key: "image", label: "Imagen", kind: "image" }]}
              />
            </div>
          </Card>
        </div>
        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <Card title="Publicación">
            <div className="flex flex-col gap-4">
              <Toggle name="visible" label="Visible" defaultChecked={p?.visible ?? true} />
              <Toggle name="featured" label="Destacado" defaultChecked={p?.featured ?? false} help="Los destacados aparecen primero en el riel." />
              {p && (
                <Field label="Orden">
                  <Input name="sort_order" type="number" defaultValue={p.sort_order} />
                </Field>
              )}
              <Field label="Color de acento" help="Colorea la tarjeta y la página del proyecto.">
                <div className="flex gap-2">
                  <input type="color" defaultValue={p?.accent ?? "#7c8cff"} className="h-10 w-12 cursor-pointer rounded border border-line bg-transparent" onChange={(e) => ((e.currentTarget.nextSibling as HTMLInputElement).value = e.currentTarget.value)} />
                  <Input name="accent" defaultValue={p?.accent ?? ""} className="font-mono" placeholder="#7c8cff" />
                </div>
              </Field>
              <Button type="submit" name="intent" value="save" disabled={busy}>
                {busy ? "Guardando…" : p ? "Guardar" : "Crear proyecto"}
              </Button>
            </div>
          </Card>
          {p && (
            <Card title="Zona de peligro">
              <Button
                type="submit"
                name="intent"
                value="delete"
                variant="danger"
                onClick={(e) => {
                  if (!confirm("¿Eliminar este proyecto?")) e.preventDefault();
                }}
              >
                Eliminar proyecto
              </Button>
            </Card>
          )}
        </aside>
      </Form>
    </>
  );
}
