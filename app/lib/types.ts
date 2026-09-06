export type SectionType =
  | "hero"
  | "about"
  | "projects"
  | "experience"
  | "skills"
  | "gallery"
  | "marquee"
  | "stats"
  | "text"
  | "contact";

export const SECTION_TYPES: { value: SectionType; label: string; description: string }[] = [
  { value: "hero", label: "Hero", description: "Portada con escena WebGL, titular y llamadas a la acción." },
  { value: "about", label: "Sobre mí", description: "Texto biográfico, foto y datos rápidos." },
  { value: "projects", label: "Proyectos", description: "Riel o cuadrícula de proyectos tomados de la tabla de proyectos." },
  { value: "experience", label: "Trayectoria", description: "Línea de tiempo de experiencia y formación." },
  { value: "skills", label: "Habilidades", description: "Constelación de tecnologías agrupadas por categoría." },
  { value: "gallery", label: "Galería", description: "Colección de imágenes de Cloudinary." },
  { value: "marquee", label: "Marquesina", description: "Cinta de texto en movimiento continuo." },
  { value: "stats", label: "Cifras", description: "Contadores animados con datos clave." },
  { value: "text", label: "Texto libre", description: "Bloque editorial en Markdown." },
  { value: "contact", label: "Contacto", description: "Cierre con formulario y enlaces." },
];

export interface Section {
  id: string;
  type: SectionType;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = "live" | "building" | "archived" | "concept";

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  role: string | null;
  year: string | null;
  status: ProjectStatus;
  url: string | null;
  repo_url: string | null;
  tags: string[];
  stack: string[];
  cover_image: string | null;
  gallery: string[];
  accent: string | null;
  featured: boolean;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export type ExperienceKind = "work" | "education" | "award" | "community";

export interface Experience {
  id: string;
  kind: ExperienceKind;
  organization: string;
  role: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  highlights: string[];
  url: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export type SkillCategory = "frontend" | "backend" | "cloud" | "data" | "design" | "product" | "tools";

export const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "cloud", label: "Cloud & Edge" },
  { value: "data", label: "Datos" },
  { value: "design", label: "Diseño" },
  { value: "product", label: "Producto" },
  { value: "tools", label: "Herramientas" },
];

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;
  sort_order: number;
  visible: boolean;
}

export interface MediaItem {
  id: string;
  public_id: string;
  url: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  resource_type: string;
  alt: string | null;
  caption: string | null;
  tags: string[];
  created_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  ip: string | null;
  user_agent: string | null;
  read: boolean;
  created_at: string;
}

export interface SocialLink {
  label: string;
  url: string;
  handle?: string;
}

export interface SiteSettings {
  name: string;
  shortName: string;
  headline: string;
  tagline: string;
  bio: string;
  location: string;
  coordinates: string;
  email: string;
  phone: string;
  availability: "open" | "busy" | "closed";
  availabilityText: string;
  avatar: string;
  ogImage: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  socials: SocialLink[];
  footerNote: string;
  resumeUrl: string;
  accent: string;
  accent2: string;
  locale: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "David Martínez",
  shortName: "DM",
  headline: "Construyo productos digitales desde Morelia para el mundo.",
  tagline: "Full-stack developer · Founder de Logidma",
  bio: "Desarrollador full-stack y fundador de Logidma. Diseño, construyo y opero productos web sobre Cloudflare Workers, D1 y React.",
  location: "Morelia, Michoacán, México",
  coordinates: "19.7008° N, 101.1844° W",
  email: "davismartinesad@gmail.com",
  phone: "",
  availability: "open",
  availabilityText: "Disponible para nuevos proyectos",
  avatar: "",
  ogImage: "",
  seoTitle: "David Martínez — Full-stack developer & founder en Morelia",
  seoDescription:
    "Portafolio de David Martínez: productos digitales, plataformas web y aplicaciones construidas sobre Cloudflare, React y D1 desde Morelia, Michoacán.",
  keywords: ["David Martínez", "desarrollador", "Morelia", "Logidma", "Cloudflare Workers", "React", "full-stack"],
  socials: [
    { label: "GitHub", url: "https://github.com/davismtz", handle: "@davismtz" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/davismtz", handle: "davismtz" },
    { label: "Email", url: "mailto:davismartinesad@gmail.com", handle: "davismartinesad@gmail.com" },
  ],
  footerNote: "Diseñado y construido en Morelia. Corre en el edge de Cloudflare.",
  resumeUrl: "",
  accent: "#38e0ff",
  accent2: "#7c8cff",
  locale: "es-MX",
};
