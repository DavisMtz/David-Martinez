import { data, useFetcher } from "react-router";
import type { Route } from "./+types/messages";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { PageHeader, Card, EmptyState, Badge } from "~/components/admin/ui";
import { cx, formatDate, str } from "~/lib/utils";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  return { messages: await repo(env).listMessages(300) };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const form = await request.formData();
  const intent = str(form.get("intent"));
  const id = str(form.get("id"));
  if (intent === "read") await r.setMessageRead(id, true);
  else if (intent === "unread") await r.setMessageRead(id, false);
  else if (intent === "delete") await r.deleteMessage(id);
  return data({ ok: true });
}

export default function Messages({ loaderData }: Route.ComponentProps) {
  const { messages } = loaderData;
  const fetcher = useFetcher();
  return (
    <>
      <PageHeader eyebrow="// mensajes" title="Bandeja de entrada" description="Mensajes enviados desde el formulario de contacto." />
      {messages.length === 0 ? (
        <EmptyState title="Sin mensajes" description="Cuando alguien escriba desde el sitio aparecerá aquí." />
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Card key={m.id} className={cx(!m.read && "border-accent/40")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-semibold">
                    {m.name} {!m.read && <Badge tone="accent">nuevo</Badge>}
                  </p>
                  <p className="text-xs text-muted">
                    <a href={`mailto:${m.email}`} className="hover:text-paper">
                      {m.email}
                    </a>{" "}
                    · {formatDate(m.created_at)} {m.subject ? `· ${m.subject}` : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject ?? "tu mensaje")}`} className="admin-btn admin-btn-outline admin-btn-sm">
                    Responder
                  </a>
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value={m.read ? "unread" : "read"} />
                    <input type="hidden" name="id" value={m.id} />
                    <button className="admin-btn admin-btn-ghost admin-btn-sm">{m.read ? "Marcar no leído" : "Marcar leído"}</button>
                  </fetcher.Form>
                  <fetcher.Form
                    method="post"
                    onSubmit={(e) => {
                      if (!confirm("¿Eliminar mensaje?")) e.preventDefault();
                    }}
                  >
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={m.id} />
                    <button className="admin-btn admin-btn-danger admin-btn-sm">Borrar</button>
                  </fetcher.Form>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
              {(m.ip || m.user_agent) && (
                <p className="mt-3 font-mono text-[10px] text-muted/60">
                  {m.ip} · {m.user_agent}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
