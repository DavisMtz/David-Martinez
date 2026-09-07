import { Form, data, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/security";
import { cloudflareContext } from "~/lib/context";
import { createSessionCookie, readStoredAuth, storePassword, verifyPassword } from "~/lib/auth.server";
import { PageHeader, Card, Field, Input, Button, Notice } from "~/components/admin/ui";
import { formatDate, str } from "~/lib/utils";

/** Mínimo cómodo de recordar y suficientemente largo. */
const MIN_LENGTH = 10;

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const stored = await readStoredAuth(env);
  return {
    usandoInicial: stored === null,
    cambiadaEl: stored?.updatedAt ?? null,
    minLength: MIN_LENGTH,
    guardada: new URL(request.url).searchParams.get("cambiada") === "1",
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);

  // Un envío sin cuerpo de formulario no debe tumbar la página.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return data({ ok: false, error: "No se recibió el formulario. Vuelve a intentarlo." }, { status: 400 });
  }

  const actual = str(form.get("actual"));
  const nueva = str(form.get("nueva"));
  const repetida = str(form.get("repetida"));

  if (!(await verifyPassword(env, actual))) {
    await new Promise((r) => setTimeout(r, 700));
    return data({ ok: false, error: "La contraseña actual no es correcta." }, { status: 401 });
  }
  if (nueva.length < MIN_LENGTH) {
    return data({ ok: false, error: `La nueva contraseña necesita al menos ${MIN_LENGTH} caracteres.` }, { status: 400 });
  }
  if (nueva !== repetida) {
    return data({ ok: false, error: "Las dos contraseñas nuevas no coinciden." }, { status: 400 });
  }
  if (nueva === actual) {
    return data({ ok: false, error: "La nueva contraseña es igual que la actual." }, { status: 400 });
  }

  const guardada = await storePassword(env, nueva);
  // Se redirige en vez de responder en el sitio: así el navegador aplica la
  // cookie nueva antes de que se recarguen los loaders. Sin esto, la
  // revalidación viajaría con la cookie vieja —ya invalidada— y cerraría la
  // sesión de quien acaba de cambiar la contraseña.
  return redirect("/admin/seguridad?cambiada=1", {
    headers: { "Set-Cookie": await createSessionCookie(env, guardada.tokenVersion) },
  });
}

export default function Security({ loaderData, actionData }: Route.ComponentProps) {
  const { usandoInicial, cambiadaEl, minLength, guardada } = loaderData;
  const nav = useNavigation();
  const busy = nav.state === "submitting";

  return (
    <>
      <PageHeader
        eyebrow="// seguridad"
        title="Contraseña del panel"
        description="Es la única llave del panel. Elige algo que recuerdes y que nadie más pueda adivinar."
      />

      {guardada && (
        <Notice kind="success">
          Contraseña actualizada. Esta sesión sigue abierta; si habías entrado desde otro equipo, ahí tendrás que volver a
          iniciar sesión.
        </Notice>
      )}
      {actionData?.error && <Notice kind="error">{actionData.error}</Notice>}

      {usandoInicial && !guardada && (
        <Notice kind="info">
          Sigues usando la contraseña que se generó al crear el sitio. Cámbiala aquí por una tuya: a partir de ese momento
          se guarda cifrada en la base de datos y el panel deja de depender del valor original.
        </Notice>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card title="Cambiar contraseña">
          <Form method="post" className="grid max-w-md gap-4" key={guardada ? "limpio" : "form"}>
            <Field label="Contraseña actual">
              <Input name="actual" type="password" autoComplete="current-password" required autoFocus />
            </Field>
            <Field
              label="Nueva contraseña"
              help={`Mínimo ${minLength} caracteres. Una frase con varias palabras es más fácil de recordar y más difícil de adivinar que una palabra con símbolos.`}
            >
              <Input name="nueva" type="password" autoComplete="new-password" minLength={minLength} required />
            </Field>
            <Field label="Repite la nueva contraseña">
              <Input name="repetida" type="password" autoComplete="new-password" minLength={minLength} required />
            </Field>
            <div>
              <Button type="submit" disabled={busy}>
                {busy ? "Guardando…" : "Cambiar contraseña"}
              </Button>
            </div>
          </Form>
        </Card>

        <aside className="flex flex-col gap-6">
          <Card title="Estado">
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="admin-label">Origen</dt>
                <dd className="mt-1">{usandoInicial ? "Contraseña inicial del despliegue" : "Contraseña propia, guardada cifrada"}</dd>
              </div>
              {cambiadaEl && (
                <div>
                  <dt className="admin-label">Último cambio</dt>
                  <dd className="mt-1">{formatDate(cambiadaEl)}</dd>
                </div>
              )}
            </dl>
          </Card>
          <Card title="Cómo se guarda">
            <p className="text-sm leading-relaxed text-muted">
              La contraseña nunca se guarda tal cual. Se deriva con PBKDF2 y SHA-256, con sal propia y 100 000
              repeticiones, y solo se almacena el resultado. Cambiarla cierra la sesión en los demás equipos.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
