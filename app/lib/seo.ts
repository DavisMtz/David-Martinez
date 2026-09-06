import type { SiteSettings } from "./types";
import { imageUrl } from "./cloudinary";

export interface SeoInput {
  settings: SiteSettings;
  siteUrl: string;
  cloudName: string;
  path?: string;
  title?: string;
  description?: string;
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
}

export function buildMeta(input: SeoInput) {
  const { settings, siteUrl, cloudName } = input;
  const title = input.title ? `${input.title} — ${settings.name}` : settings.seoTitle || settings.name;
  const description = input.description || settings.seoDescription;
  const url = new URL(input.path ?? "/", siteUrl).toString();
  const imageRef = input.image ?? settings.ogImage ?? settings.avatar;
  const image = imageRef ? imageUrl(imageRef, cloudName, { w: 1200, h: 630, crop: "fill", gravity: "auto" }) : "";

  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: settings.keywords.join(", ") },
    { name: "author", content: settings.name },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: settings.name },
    { property: "og:locale", content: settings.locale.replace("-", "_") },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
  }
  if (input.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return [...meta, { tagName: "link", rel: "canonical", href: url }];
}

export function personJsonLd(settings: SiteSettings, siteUrl: string, cloudName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.name,
    url: siteUrl,
    email: settings.email ? `mailto:${settings.email}` : undefined,
    jobTitle: settings.tagline,
    description: settings.seoDescription,
    image: settings.avatar ? imageUrl(settings.avatar, cloudName, { w: 800, h: 800 }) : undefined,
    address: settings.location ? { "@type": "PostalAddress", addressLocality: settings.location } : undefined,
    sameAs: settings.socials.filter((s) => !s.url.startsWith("mailto:")).map((s) => s.url),
  };
}
