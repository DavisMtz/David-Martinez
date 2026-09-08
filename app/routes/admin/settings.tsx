import { Form, data, useNavigation } from "react-router";
import type { Route } from "./+types/settings";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, Field, Input, Textarea, Select, Button, Notice, Toggle } from "~/components/admin/ui";
import { ImagePicker } from "~/components/admin/ImagePicker";
import { ObjectsEditor } from "~/components/admin/ObjectsEditor";
import { parseList, str } from "~/lib/utils";
import type { SiteSettings, SocialLink } from "~/lib/types";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { settings: await repo(env).getSettings() };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const form = await request.formData();
  let socials: SocialLink[] = [];
  try {
    socials = (JSON.parse(String(form.get("socials") ?? "[]")) as SocialLink[]).filter((s) => s.label && s.url);
  } catch {
    return data({ ok: false, error: "Las redes sociales no tienen un formato válido." }, { status: 400 });
  }
  const availability = str(form.get("availability"), "open") as SiteSettings["availability"];
  const patch: Partial<SiteSettings> = {
    name: str(form.get("name")),
    shortName: str(form.get("shortName")),
    headline: str(form.get("headline")),
    tagline: str(form.get("tagline")),
    bio: str(form.get("bio")),
    location: str(form.get("location")),
    coordinates: str(form.get("coordinates")),
    email: str(form.get("email")),
    phone: str(form.get("phone")),
    availability: ["open", "busy", "closed"].includes(availability) ? availability : "open",
    availabilityText: str(form.get("availabilityText")),
    avatar: str(form.get("avatar")),
    ogImage: str(form.get("ogImage")),
    seoTitle: str(form.get("seoTitle")),
    seoDescription: str(form.get("seoDescription")),
    keywords: parseList(form.get("keywords")),
    socials,
    footerNote: str(form.get("footerNote")),
    resumeUrl: str(form.get("resumeUrl")),
    accent: str(form.get("accent")) || "#38e0ff",
    accent2: str(form.get("accent2")) || "#7c8cff",
    locale: str(form.get("locale")) || "es-MX",
    motionMode: ["immersive", "subtle", "still"].includes(String(form.get("motionMode"))) ? form.get("motionMode") as SiteSettings["motionMode"] : "immersive",
    showJourney: form.getAll("showJourney").includes("1"),
    introEnabled: form.getAll("introEnabled").includes("1"),
  };
  if (!patch.name) return data({ ok: false, error: "El nombre es obligatorio." }, { status: 400 });
  await repo(env).saveSettings(patch);
  return data({ ok: true, error: null });
}

export default function Settings({ loaderData, actionData }: Route.ComponentProps) {
  const s = loaderData.settings;
  const nav = useNavigation();
  const busy = nav.state === "submitting";
  return (
    <Form method="post" className="flex flex-col gap-6">
      <PageHeader
        eyebrow="// ajustes"
        title="Identidad y SEO"
        description="Datos globales que usan todas las secciones."
        actions={
          <Button type="submit" disabled={busy}>
            {busy ? "Guardando…" : "Guardar cambios"}
          </Button>
        }
      />
      {actionData?.ok && <Notice kind="success">Ajustes guardados.</Notice>}
      {actionData?.error && <Notice kind="error">{actionData.error}</Notice>}

      <Card title="Identidad">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre completo">
            <Input name="name" defaultValue={s.name} required />
          </Field>
          <Field label="Iniciales / marca corta">
            <Input name="shortName" defaultValue={s.shortName} />
          </Field>
          <Field label="Tagline (rol en una línea)" className="md:col-span-2">
            <Input name="tagline" defaultValue={s.tagline} />
          </Field>
          <Field label="Titular por defecto" className="md:col-span-2" help="Se usa como respaldo si el hero no define uno.">
            <Input name="headline" defaultValue={s.headline} />
          </Field>
          <Field label="Bio corta (Markdown)" className="md:col-span-2">
            <Textarea name="bio" defaultValue={s.bio} />
          </Field>
          <Field label="Ubicación">
            <Input name="location" defaultValue={s.location} />
          </Field>
          <Field label="Coordenadas (decorativo)">
            <Input name="coordinates" defaultValue={s.coordinates} className="font-mono" />
          </Field>
          <ImagePicker name="avatar" value={s.avatar} label="Retrato" aspect="1/1" />
          <ImagePicker name="ogImage" value={s.ogImage} label="Imagen para redes (OG)" />
        </div>
      </Card>

      <Card title="Contacto y disponibilidad">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Correo público">
            <Input name="email" type="email" defaultValue={s.email} />
          </Field>
          <Field label="Teléfono / WhatsApp">
            <Input name="phone" defaultValue={s.phone} placeholder="+52 443 ..." />
          </Field>
          <Field label="Disponibilidad">
            <Select name="availability" defaultValue={s.availability}>
              <option value="open">Disponible</option>
              <option value="busy">Con cupo limitado</option>
              <option value="closed">Sin disponibilidad</option>
            </Select>
          </Field>
          <Field label="Texto de disponibilidad">
            <Input name="availabilityText" defaultValue={s.availabilityText} />
          </Field>
          <Field label="URL de CV (opcional)" className="md:col-span-2">
            <Input name="resumeUrl" defaultValue={s.resumeUrl} placeholder="https://…" />
          </Field>
          <div className="md:col-span-2">
            <ObjectsEditor
              name="socials"
              label="Redes y enlaces"
              value={s.socials}
              fields={[
                { key: "label", label: "Nombre", kind: "text" },
                { key: "handle", label: "Usuario (opcional)", kind: "text" },
                { key: "url", label: "URL", kind: "text" },
              ]}
            />
          </div>
        </div>
      </Card>

      <Card title="SEO">
        <div className="grid gap-4">
          <Field label="Título SEO">
            <Input name="seoTitle" defaultValue={s.seoTitle} />
          </Field>
          <Field label="Descripción SEO" help="Ideal: 120–160 caracteres.">
            <Textarea name="seoDescription" defaultValue={s.seoDescription} />
          </Field>
          <Field label="Palabras clave" help="Una por línea o separadas por coma.">
            <Textarea name="keywords" defaultValue={s.keywords.join("\n")} className="font-mono text-sm" />
          </Field>
          <Field label="Locale">
            <Input name="locale" defaultValue={s.locale} className="font-mono" />
          </Field>
        </div>
      </Card>

      <Card title="Experiencia visual">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Movimiento al recorrer la página" help="La preferencia de movimiento reducido del visitante siempre tiene prioridad.">
            <Select name="motionMode" defaultValue={s.motionMode}>
              <option value="immersive">Inmersivo · profundidad y transformaciones</option>
              <option value="subtle">Sutil · entradas suaves</option>
              <option value="still">Sin animaciones</option>
            </Select>
          </Field>
          <div className="flex flex-col gap-4">
            <Toggle name="showJourney" label="Mostrar recorrido y sección actual" defaultChecked={s.showJourney} />
            <Toggle name="introEnabled" label="Mostrar apertura al entrar" defaultChecked={s.introEnabled} />
          </div>
          <p className="text-sm text-muted md:col-span-2">En Secciones → Hero puedes cambiar las órbitas por ondas o cuadrícula, ajustar luminosidad y velocidad, y editar sus conceptos. Textos, fotografías, proyectos y orden de las secciones siguen en sus apartados habituales.</p>
        </div>
      </Card>
      <Card title="Apariencia">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Color de acento">
            <div className="flex gap-2">
              <input type="color" defaultValue={s.accent} className="h-10 w-12 cursor-pointer rounded border border-line bg-transparent" onChange={(e) => ((e.currentTarget.nextSibling as HTMLInputElement).value = e.currentTarget.value)} />
              <Input name="accent" defaultValue={s.accent} className="font-mono" />
            </div>
          </Field>
          <Field label="Acento secundario">
            <div className="flex gap-2">
              <input type="color" defaultValue={s.accent2} className="h-10 w-12 cursor-pointer rounded border border-line bg-transparent" onChange={(e) => ((e.currentTarget.nextSibling as HTMLInputElement).value = e.currentTarget.value)} />
              <Input name="accent2" defaultValue={s.accent2} className="font-mono" />
            </div>
          </Field>
          <Field label="Nota del pie de página" className="md:col-span-3">
            <Input name="footerNote" defaultValue={s.footerNote} />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </Form>
  );
}
