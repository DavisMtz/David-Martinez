import { data } from "react-router";
import { z } from "zod";
import type { Route } from "./+types/contact";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";

const schema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(120),
  email: z.string().trim().email("Correo inválido").max(200),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().min(10, "Cuéntame un poco más (mínimo 10 caracteres)").max(5000),
  // Honeypot: real users never fill this
  website: z.string().max(0).optional().default(""),
  // Time-on-page guard (ms since form render)
  t: z.coerce.number().optional().default(0),
});

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") return data({ ok: false, error: "Método no permitido" }, { status: 405 });
  const { env } = context.get(cloudflareContext);
  const form = Object.fromEntries(await request.formData());
  const parsed = schema.safeParse(form);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return data({ ok: false, error: first?.message ?? "Datos inválidos" }, { status: 400 });
  }
  const v = parsed.data;
  if (v.website) return data({ ok: true }); // silently drop bots
  if (v.t && v.t < 1500) return data({ ok: true });
  await repo(env).addMessage({
    name: v.name,
    email: v.email,
    subject: v.subject || null,
    body: v.message,
    ip: request.headers.get("CF-Connecting-IP"),
    user_agent: request.headers.get("User-Agent"),
  });
  return data({ ok: true });
}

export function loader() {
  return data({ ok: false, error: "Usa POST" }, { status: 405 });
}
