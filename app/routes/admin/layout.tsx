import { Form, Link, NavLink, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { cloudflareContext } from "~/lib/context";
import { requireAdmin } from "~/lib/auth.server";
import { repo } from "~/lib/db.server";
import { AdminContext } from "~/components/admin/context";
import { cx } from "~/lib/utils";

export const headers: Route.HeadersFunction = () => ({
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store",
});

export function meta() {
  return [{ title: "Panel · David Martínez" }, { name: "robots", content: "noindex, nofollow" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireAdmin(request, env);
  const r = repo(env);
  const [counts, media, settings] = await Promise.all([r.counts(), r.listMedia(500), r.getSettings()]);
  return { counts, media, cloudName: env.CLOUDINARY_CLOUD_NAME, siteUrl: env.SITE_URL, name: settings.name };
}

const NAV = [
  { to: "/admin", label: "Resumen", end: true },
  { to: "/admin/secciones", label: "Secciones" },
  { to: "/admin/proyectos", label: "Proyectos" },
  { to: "/admin/experiencia", label: "Trayectoria" },
  { to: "/admin/habilidades", label: "Habilidades" },
  { to: "/admin/media", label: "Media" },
  { to: "/admin/mensajes", label: "Mensajes" },
  { to: "/admin/ajustes", label: "Ajustes" },
];

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { counts, media, cloudName, siteUrl, name } = loaderData;
  return (
    <AdminContext.Provider value={{ cloudName, media }}>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="flex items-center justify-between gap-3 px-1">
            <Link to="/admin" className="font-display text-lg font-bold tracking-tight">
              {name}
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.25em] text-accent">panel</span>
            </Link>
          </div>
          <nav className="mt-6 flex flex-row flex-wrap gap-1 lg:flex-col">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cx("admin-nav", isActive && "admin-nav-active")}
              >
                <span>{item.label}</span>
                {item.to === "/admin/mensajes" && counts.unread > 0 && (
                  <span className="ml-auto rounded-full bg-accent px-1.5 text-[10px] font-semibold text-ink">{counts.unread}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto hidden flex-col gap-2 pt-8 lg:flex">
            <a href={siteUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline admin-btn-sm justify-center">
              Ver sitio ↗
            </a>
            <Form method="post" action="/admin/logout">
              <button className="admin-btn admin-btn-ghost admin-btn-sm w-full justify-center">Cerrar sesión</button>
            </Form>
          </div>
        </aside>
        <main className="admin-main">
          <Outlet />
          <div className="mt-10 flex gap-3 lg:hidden">
            <a href={siteUrl} target="_blank" rel="noreferrer" className="admin-btn admin-btn-outline admin-btn-sm">
              Ver sitio ↗
            </a>
            <Form method="post" action="/admin/logout">
              <button className="admin-btn admin-btn-ghost admin-btn-sm">Cerrar sesión</button>
            </Form>
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}
