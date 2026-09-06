import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSite } from "./context";
import { Magnetic } from "./Magnetic";
import { cx } from "~/lib/utils";

export interface NavItem {
  id: string;
  label: string;
}

export function Nav({ items }: { items: NavItem[] }) {
  const { settings } = useSite();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    return () => document.documentElement.classList.remove("menu-open");
  }, [open]);

  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);
  const status = settings.availability;

  return (
    <>
      <header className={cx("site-nav", scrolled && "site-nav--scrolled")}>
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight" aria-label="Inicio">
          {settings.shortName || "DM"}
          <span className="text-accent">.</span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Secciones">
          {items.map((item, i) => (
            <a key={item.id} href={href(item.id)} className="nav-link">
              <span className="nav-index">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          {status !== "closed" && (
            <span className="nav-availability flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              <span className={cx("status-dot", status === "busy" && "status-dot--busy")} />
              {settings.availabilityText}
            </span>
          )}
          <Magnetic>
            <a href={href("contacto")} className="btn-primary">
              Hablemos
            </a>
          </Magnetic>
        </div>
        <button
          type="button"
          className="menu-btn lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.25em]">{open ? "cerrar" : "menú"}</span>
        </button>
      </header>
      <div id="mobile-menu" className={cx("mobile-menu", open && "mobile-menu--open")} aria-hidden={!open}>
        <nav className="flex flex-col gap-2">
          {items.map((item, i) => (
            <a key={item.id} href={href(item.id)} className="mobile-link" onClick={() => setOpen(false)}>
              <span className="nav-index">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mt-10 flex flex-col gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          {settings.socials.slice(0, 6).map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="hover:text-paper">
              {s.label} ↗
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
