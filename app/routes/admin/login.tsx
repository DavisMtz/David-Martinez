import { Form, data, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { cloudflareContext } from "~/lib/context";
import { createSessionCookie, isAuthenticated, verifyPassword } from "~/lib/auth.server";
import { safeNext } from "~/lib/utils";

export const headers: Route.HeadersFunction = () => ({ "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" });

export function meta() {
  return [{ title: "Acceso · Panel" }, { name: "robots", content: "noindex, nofollow" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  if (await isAuthenticated(request, env)) throw redirect("/admin");
  const url = new URL(request.url);
  return {
    configured: Boolean(env.ADMIN_PASSWORD && env.SESSION_SECRET),
    next: safeNext(url.searchParams.get("next")),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = safeNext(form.get("next"));
  if (!(await verifyPassword(env, password))) {
    await new Promise((r) => setTimeout(r, 700));
    return data({ error: "Contraseña incorrecta." }, { status: 401 });
  }
  return redirect(next, { headers: { "Set-Cookie": await createSessionCookie(env) } });
}

export default function Login({ loaderData, actionData }: Route.ComponentProps) {
  const nav = useNavigation();
  const busy = nav.state !== "idle";
  return (
    <main className="admin-login">
      <div className="admin-login-grid" aria-hidden="true" />
      <Form method="post" className="admin-card relative w-full max-w-sm">
        <p className="admin-eyebrow">// acceso restringido</p>
        <h1 className="font-display text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="mt-1 text-sm text-muted">Edita secciones, proyectos, imágenes y mensajes.</p>
        {!loaderData.configured && (
          <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-200">
            Faltan los secretos <code>ADMIN_PASSWORD</code> y <code>SESSION_SECRET</code>. Configúralos con{" "}
            <code>wrangler secret put</code> o en <code>.dev.vars</code>.
          </p>
        )}
        <input type="hidden" name="next" value={loaderData.next} />
        <label className="admin-label mt-6 block" htmlFor="password">
          Contraseña
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" autoFocus required className="admin-input mt-1.5" />
        {actionData?.error && <p className="mt-3 text-sm text-accent">{actionData.error}</p>}
        <button className="admin-btn admin-btn-primary mt-6 w-full justify-center" disabled={busy}>
          {busy ? "Verificando…" : "Entrar"}
        </button>
        <a href="/" className="mt-4 block text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted hover:text-paper">
          ← volver al sitio
        </a>
      </Form>
    </main>
  );
}
