import { useRef, useState } from "react";
import { data, useFetcher, useRevalidator } from "react-router";
import type { Route } from "./+types/media";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { destroyResource, listResources, UPLOAD_FOLDER } from "~/lib/cloudinary.server";
import { PageHeader, Card, Button, Notice, EmptyState } from "~/components/admin/ui";
import { uploadToCloudinary } from "~/components/admin/upload";
import { imageUrl } from "~/lib/cloudinary";
import { formBool, nullable, str } from "~/lib/utils";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { media: await repo(env).listMedia(500), cloudName: env.CLOUDINARY_CLOUD_NAME, folder: UPLOAD_FOLDER };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"));

  if (intent === "register") {
    try {
      const p = JSON.parse(String(form.get("payload") ?? "{}")) as {
        public_id: string;
        secure_url: string;
        width?: number;
        height?: number;
        format?: string;
        bytes?: number;
        resource_type?: string;
      };
      if (!p.public_id || !p.secure_url) throw new Error("payload incompleto");
      const item = await r.saveMedia({
        public_id: p.public_id,
        url: p.secure_url,
        width: p.width ?? null,
        height: p.height ?? null,
        format: p.format ?? null,
        bytes: p.bytes ?? null,
        resource_type: p.resource_type ?? "image",
      });
      return data({ ok: true, item, message: null });
    } catch (e) {
      return data({ ok: false, error: e instanceof Error ? e.message : "No se pudo registrar" }, { status: 400 });
    }
  }
  if (intent === "meta") {
    await r.updateMediaMeta(str(form.get("id")), nullable(form.get("alt")), nullable(form.get("caption")));
    return data({ ok: true });
  }
  if (intent === "delete") {
    const item = await r.deleteMedia(str(form.get("id")));
    if (item && formBool(form, "destroy")) await destroyResource(env, item.public_id, item.resource_type);
    return data({ ok: true });
  }
  if (intent === "sync") {
    try {
      const resources = await listResources(env, UPLOAD_FOLDER + "/", 500);
      for (const res of resources) {
        await r.saveMedia({
          public_id: res.public_id,
          url: res.secure_url,
          width: res.width,
          height: res.height,
          format: res.format,
          bytes: res.bytes,
          resource_type: res.resource_type,
          tags: res.tags ?? [],
        });
      }
      return data({ ok: true, message: `Sincronizadas ${resources.length} imágenes de la carpeta «${UPLOAD_FOLDER}».` });
    } catch (e) {
      return data({ ok: false, error: e instanceof Error ? e.message : "Error al sincronizar" }, { status: 500 });
    }
  }
  return data({ error: "Acción desconocida" }, { status: 400 });
}

export default function Media({ loaderData, actionData }: Route.ComponentProps) {
  const { media, cloudName, folder } = loaderData;
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [queue, setQueue] = useState<{ name: string; pct: number; error?: string }[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    for (const file of list) {
      setQueue((q) => [...q, { name: file.name, pct: 0 }]);
      try {
        const res = await uploadToCloudinary(file, {
          folder,
          onProgress: (pct) => setQueue((q) => q.map((x) => (x.name === file.name ? { ...x, pct } : x))),
        });
        const fd = new FormData();
        fd.set("intent", "register");
        fd.set("payload", JSON.stringify(res));
        await fetch("/admin/media", { method: "POST", body: fd });
      } catch (e) {
        setQueue((q) => q.map((x) => (x.name === file.name ? { ...x, error: e instanceof Error ? e.message : "error" } : x)));
      }
    }
    revalidator.revalidate();
    setTimeout(() => setQueue((q) => q.filter((x) => x.error)), 1500);
  }

  const msg = (actionData as { message?: string | null } | undefined)?.message ?? null;
  const err = (actionData as { error?: string | null } | undefined)?.error ?? null;

  return (
    <>
      <PageHeader
        eyebrow="// media"
        title="Biblioteca de imágenes"
        description={`Las imágenes se suben directamente a Cloudinary (carpeta «${folder}») y se optimizan automáticamente.`}
        actions={
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="sync" />
            <Button variant="outline" disabled={fetcher.state !== "idle"}>
              {fetcher.state !== "idle" ? "Sincronizando…" : "Sincronizar desde Cloudinary"}
            </Button>
          </fetcher.Form>
        }
      />
      {msg && <Notice kind="success">{msg}</Notice>}
      {err && <Notice kind="error">{String(err)}</Notice>}
      {(fetcher.data as { message?: string | null } | undefined)?.message && (
        <Notice kind="success">{String((fetcher.data as { message?: string }).message)}</Notice>
      )}

      <div
        className={`mt-4 mb-8 rounded-xl border-2 border-dashed p-10 text-center transition ${drag ? "border-accent bg-accent/5" : "border-line"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <p className="font-display text-lg font-semibold">Arrastra imágenes aquí</p>
        <p className="mt-1 text-sm text-muted">o</p>
        <Button type="button" variant="outline" className="mt-3" onClick={() => inputRef.current?.click()}>
          Seleccionar archivos
        </Button>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => e.target.files && void handleFiles(e.target.files)} />
        {queue.length > 0 && (
          <ul className="mx-auto mt-5 max-w-md text-left text-xs">
            {queue.map((q) => (
              <li key={q.name} className="flex items-center gap-3 py-1">
                <span className="flex-1 truncate">{q.name}</span>
                {q.error ? <span className="text-accent">{q.error}</span> : <span className="font-mono text-muted">{q.pct}%</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {media.length === 0 ? (
        <EmptyState title="Biblioteca vacía" description="Sube tu primera imagen o sincroniza desde Cloudinary." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
            <Card key={m.id} className="p-3">
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-ink-3">
                <img src={imageUrl(m.public_id, cloudName, { w: 600, h: 450, crop: "fill" })} alt={m.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <p className="mt-2 truncate font-mono text-[11px] text-muted" title={m.public_id}>
                {m.public_id}
              </p>
              <p className="font-mono text-[10px] text-muted/70">
                {m.width}×{m.height} · {m.format} · {m.bytes ? Math.round(m.bytes / 1024) : "?"} KB
              </p>
              <fetcher.Form method="post" className="mt-2 flex flex-col gap-2">
                <input type="hidden" name="intent" value="meta" />
                <input type="hidden" name="id" value={m.id} />
                <input name="alt" defaultValue={m.alt ?? ""} placeholder="Texto alternativo" className="admin-input text-xs" />
                <div className="flex gap-1">
                  <button className="admin-btn admin-btn-outline admin-btn-sm flex-1 justify-center">Guardar alt</button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => navigator.clipboard?.writeText(m.public_id)}
                    title="Copiar public_id"
                  >
                    Copiar
                  </button>
                </div>
              </fetcher.Form>
              <fetcher.Form
                method="post"
                className="mt-1 flex items-center justify-between gap-2"
                onSubmit={(e) => {
                  if (!confirm("¿Quitar de la biblioteca?")) e.preventDefault();
                }}
              >
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="id" value={m.id} />
                <label className="flex items-center gap-1 text-[11px] text-muted">
                  <input type="checkbox" name="destroy" value="1" className="admin-checkbox" /> borrar también en Cloudinary
                </label>
                <button className="admin-btn admin-btn-danger admin-btn-sm">Quitar</button>
              </fetcher.Form>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
