import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { cloudflareContext } from "~/lib/context";
import { repo } from "~/lib/db.server";
import { SiteContext } from "~/components/site/context";
import { Nav, type NavItem } from "~/components/site/Nav";
import { Footer } from "~/components/site/Footer";
import { Grain } from "~/components/site/Grain";
import { ScrollReveals } from "~/components/site/ScrollReveals";
import { SECTION_TYPES } from "~/lib/types";

const Cursor = lazy(() => import("~/components/site/Cursor.client"));
const SmoothScroll = lazy(() => import("~/components/site/SmoothScroll.client"));

const NAV_TYPES = new Set(["about", "projects", "experience", "skills", "gallery", "contact"]);

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const r = repo(env);
  const [settings, sections] = await Promise.all([r.getSettings(), r.listSections(true)]);
  const navItems: NavItem[] = sections
    .filter((s) => NAV_TYPES.has(s.type))
    .map((s) => ({
      id: s.type === "contact" ? "contacto" : s.id,
      label: (s.eyebrow || SECTION_TYPES.find((t) => t.value === s.type)?.label || s.type).trim().slice(0, 18),
    }))
    .filter((item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx)
    .slice(0, 5);
  return { settings, navItems, cloudName: env.CLOUDINARY_CLOUD_NAME, siteUrl: env.SITE_URL };
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? <Suspense fallback={null}>{children}</Suspense> : null;
}

export default function SiteLayout({ loaderData }: Route.ComponentProps) {
  const { settings, navItems, cloudName, siteUrl } = loaderData;
  const themeVars = `:root{--color-accent:${settings.accent};--color-accent-2:${settings.accent2};}`;
  return (
    <SiteContext.Provider value={{ settings, cloudName, siteUrl }}>
      <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      <ClientOnly>
        <SmoothScroll />
        <Cursor />
      </ClientOnly>
      <Nav items={navItems} />
      <div className="site-page">
        <Outlet />
      </div>
      <Footer />
      <Grain />
      <ScrollReveals />
    </SiteContext.Provider>
  );
}
