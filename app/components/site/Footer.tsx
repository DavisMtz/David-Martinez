import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSite } from "./context";

function LocalTime() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "America/Mexico_City" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{time || "--:--:--"}</span>;
}

export function Footer() {
  const { settings } = useSite();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" id="footer">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-10 border-t border-line pt-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-[clamp(3rem,9vw,7rem)] font-extrabold leading-none tracking-tighter">
              {settings.shortName || "DM"}
              <span className="text-accent">.</span>
            </p>
            <p className="mt-4 max-w-sm text-sm text-muted">{settings.footerNote}</p>
          </div>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Redes</p>
            <ul className="flex flex-col gap-2">
              {settings.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="link-underline text-sm">
                    {s.label}
                    {s.handle ? <span className="ml-2 font-mono text-xs text-muted">{s.handle}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="eyebrow mb-4">Base</p>
            <p className="text-sm">{settings.location}</p>
            <p className="font-mono text-xs text-muted">{settings.coordinates}</p>
            <p className="mt-3 font-mono text-xs text-muted">
              hora local · <LocalTime />
            </p>
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="link-underline mt-6 inline-block text-sm">
                {settings.email}
              </a>
            )}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-line py-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {settings.name}
          </p>
          <p className="flex items-center gap-3">
            <span>Hecho en Morelia</span>
            <span className="text-paper/30">·</span>
            <span>Cloudflare Workers + D1</span>
            <span className="text-paper/30">·</span>
            <Link to="/admin" className="hover:text-paper" rel="nofollow">
              panel
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
