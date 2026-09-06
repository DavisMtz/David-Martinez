import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { Section } from "~/lib/types";
import { resolveContent } from "~/lib/sections";
import { useSite } from "../context";
import { Container } from "../Container";
import { Reveal } from "../Reveal";
import { Magnetic } from "../Magnetic";
import { SocialIcon } from "../SocialIcon";

interface ContactContent {
  body: string;
  showForm: boolean;
  links: { label: string; url: string }[];
}

export function Contact({ section, index }: { section: Section; index: number }) {
  const { settings } = useSite();
  const c = resolveContent<ContactContent>("contact", section.content);
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [renderedAt, setRenderedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => setRenderedAt(Date.now()), []);
  const sent = fetcher.data?.ok === true;
  const busy = fetcher.state !== "idle";
  const wa = settings.phone ? `https://wa.me/${settings.phone.replace(/\D/g, "")}` : null;

  useEffect(() => {
    if (sent) formRef.current?.reset();
  }, [sent]);

  return (
    <section id="contacto" className="section" data-section="contact" data-section-id={section.id}>
      <Container>
        <p data-reveal className="eyebrow">
          <span className="text-paper/60">{String(index).padStart(2, "0")}</span>
          <span className="mx-3 text-paper/30">—</span>
          {section.eyebrow || "Contacto"}
        </p>
        <Reveal as="h2" className="display-xl mt-4" type="words">
          {section.title || "Hablemos."}
        </Reveal>
        <div className="mt-10 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p data-reveal className="max-w-md text-lg text-muted md:text-xl">
              {section.subtitle || c.body}
            </p>
            {settings.email && (
              <div data-reveal className="mt-8">
                <Magnetic>
                  <a href={`mailto:${settings.email}`} className="contact-email">
                    {settings.email}
                  </a>
                </Magnetic>
              </div>
            )}
            <ul data-reveal className="mt-8 flex flex-wrap gap-3">
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noreferrer" className="social-chip social-chip--lg" aria-label="WhatsApp" title="WhatsApp">
                    <SocialIcon name="whatsapp" className="h-5 w-5" />
                  </a>
                </li>
              )}
              {settings.socials
                .filter((s) => !s.url.startsWith("mailto:"))
                .map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="social-chip social-chip--lg" aria-label={s.label} title={s.label}>
                      <SocialIcon url={s.url} label={s.label} className="h-5 w-5" />
                    </a>
                  </li>
                ))}
              {c.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer" className="social-chip social-chip--lg" aria-label={l.label} title={l.label}>
                    <SocialIcon url={l.url} label={l.label} className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {c.showForm && (
            <div className="md:col-span-6 md:col-start-7" data-reveal>
              {sent ? (
                <div className="rounded-2xl border border-accent/40 bg-accent/5 p-8">
                  <p className="font-display text-2xl font-bold">Mensaje recibido.</p>
                  <p className="mt-2 text-muted">Te respondo pronto. Gracias por escribir.</p>
                </div>
              ) : (
                <fetcher.Form ref={formRef} method="post" action="/api/contact" className="contact-form">
                  <input type="hidden" name="t" value={renderedAt ? Date.now() - renderedAt : 0} readOnly />
                  <div className="hidden" aria-hidden="true">
                    <label>
                      Sitio web <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="field">
                      <span>Nombre</span>
                      <input name="name" required minLength={2} autoComplete="name" placeholder="Tu nombre" />
                    </label>
                    <label className="field">
                      <span>Correo</span>
                      <input name="email" type="email" required autoComplete="email" placeholder="tu@correo.com" />
                    </label>
                  </div>
                  <label className="field">
                    <span>Asunto</span>
                    <input name="subject" placeholder="¿De qué se trata?" />
                  </label>
                  <label className="field">
                    <span>Mensaje</span>
                    <textarea name="message" required minLength={10} rows={5} placeholder="Cuéntame qué quieres construir, arreglar o automatizar." />
                  </label>
                  {fetcher.data?.error && <p className="text-sm text-accent">{fetcher.data.error}</p>}
                  <Magnetic>
                    <button type="submit" className="btn-primary btn-lg" disabled={busy}>
                      {busy ? "Enviando…" : "Enviar mensaje"}
                      <span aria-hidden="true">→</span>
                    </button>
                  </Magnetic>
                </fetcher.Form>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
