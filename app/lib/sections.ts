import type { SectionType } from "./types";

export type FieldKind =
  | "text"
  | "textarea"
  | "markdown"
  | "number"
  | "boolean"
  | "color"
  | "image"
  | "select"
  | "list"
  | "objects";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** For kind = "objects": the columns of every row. */
  fields?: FieldDef[];
}

export interface SectionSpec {
  type: SectionType;
  defaults: Record<string, unknown>;
  fields: FieldDef[];
}

const link = (key: string, label: string): FieldDef => ({
  key,
  label,
  kind: "objects",
  fields: [
    { key: "label", label: "Texto", kind: "text" },
    { key: "url", label: "URL", kind: "text" },
  ],
});

export const SECTION_SPECS: Record<SectionType, SectionSpec> = {
  hero: {
    type: "hero",
    defaults: {
      headline: "Diseño la *cuadrícula invisible*.",
      sub: "Fundador de Logidma. Arquitecto de sistemas que convierten la fricción manual en flujos que simplemente funcionan.",
      ctaPrimary: { label: "Ver proyectos", url: "#proyectos" },
      ctaSecondary: { label: "Hablemos", url: "#contacto" },
      scene: "lattice",
      ticker: ["Morelia, MX", "Cloudflare Workers", "React", "Apps Script", "IA aplicada", "Google Workspace"],
      showAvailability: true,
    },
    fields: [
      { key: "headline", label: "Titular", kind: "textarea", help: "Usa *asteriscos* para resaltar palabras con el color de acento. Salto de línea = nueva línea." },
      { key: "sub", label: "Bajada", kind: "textarea" },
      {
        key: "scene",
        label: "Escena WebGL",
        kind: "select",
        options: [
          { value: "lattice", label: "Cuadrícula invisible (puntos reactivos)" },
          { value: "waves", label: "Campo de ondas" },
          { value: "none", label: "Sin escena (solo gradiente)" },
        ],
      },
      {
        key: "ctaPrimary",
        label: "Botón principal",
        kind: "objects",
        fields: [
          { key: "label", label: "Texto", kind: "text" },
          { key: "url", label: "URL", kind: "text" },
        ],
      },
      {
        key: "ctaSecondary",
        label: "Botón secundario",
        kind: "objects",
        fields: [
          { key: "label", label: "Texto", kind: "text" },
          { key: "url", label: "URL", kind: "text" },
        ],
      },
      { key: "ticker", label: "Palabras del ticker", kind: "list", help: "Una por línea." },
      { key: "showAvailability", label: "Mostrar disponibilidad", kind: "boolean" },
    ],
  },
  about: {
    type: "about",
    defaults: {
      body: "",
      image: "",
      facts: [
        { label: "Base", value: "Morelia, Michoacán" },
        { label: "Rol", value: "Fundador & CEO · Logidma" },
        { label: "Enfoque", value: "Sistemas, automatización, producto" },
      ],
      badges: ["Autodidacta", "Lógica", "Sistemas", "Producto"],
    },
    fields: [
      { key: "body", label: "Texto (Markdown)", kind: "markdown" },
      { key: "image", label: "Imagen", kind: "image" },
      {
        key: "facts",
        label: "Datos rápidos",
        kind: "objects",
        fields: [
          { key: "label", label: "Etiqueta", kind: "text" },
          { key: "value", label: "Valor", kind: "text" },
        ],
      },
      { key: "badges", label: "Etiquetas", kind: "list" },
    ],
  },
  projects: {
    type: "projects",
    defaults: { layout: "rail", limit: 8, onlyFeatured: false, showAllLink: false },
    fields: [
      {
        key: "layout",
        label: "Distribución",
        kind: "select",
        options: [
          { value: "rail", label: "Riel horizontal (scroll pineado)" },
          { value: "grid", label: "Cuadrícula" },
          { value: "list", label: "Lista editorial" },
        ],
      },
      { key: "limit", label: "Máximo de proyectos", kind: "number" },
      { key: "onlyFeatured", label: "Solo destacados", kind: "boolean" },
    ],
  },
  experience: {
    type: "experience",
    defaults: { kinds: ["work", "education", "award", "community"] },
    fields: [{ key: "kinds", label: "Tipos a mostrar", kind: "list", help: "work, education, award, community (uno por línea)" }],
  },
  skills: {
    type: "skills",
    defaults: { layout: "constellation" },
    fields: [
      {
        key: "layout",
        label: "Distribución",
        kind: "select",
        options: [
          { value: "constellation", label: "Constelación" },
          { value: "grid", label: "Cuadrícula por categoría" },
        ],
      },
    ],
  },
  gallery: {
    type: "gallery",
    defaults: { layout: "strip", items: [] },
    fields: [
      {
        key: "layout",
        label: "Distribución",
        kind: "select",
        options: [
          { value: "strip", label: "Tira horizontal" },
          { value: "masonry", label: "Mosaico" },
        ],
      },
      {
        key: "items",
        label: "Imágenes",
        kind: "objects",
        fields: [
          { key: "image", label: "Imagen", kind: "image" },
          { key: "caption", label: "Pie de foto", kind: "text" },
        ],
      },
    ],
  },
  marquee: {
    type: "marquee",
    defaults: { items: ["La lógica, sistematizada", "Diseño · Métodos · Agilidad", "Morelia → mundo"], speed: 40 },
    fields: [
      { key: "items", label: "Frases", kind: "list" },
      { key: "speed", label: "Velocidad (segundos por vuelta)", kind: "number" },
    ],
  },
  stats: {
    type: "stats",
    defaults: {
      items: [
        { value: "8", suffix: "", label: "Productos lanzados" },
        { value: "34", suffix: "+", label: "Repositorios" },
        { value: "72", suffix: "h", label: "Tiempo de respuesta" },
        { value: "100", suffix: "%", label: "En el edge" },
      ],
    },
    fields: [
      {
        key: "items",
        label: "Cifras",
        kind: "objects",
        fields: [
          { key: "value", label: "Número", kind: "text" },
          { key: "suffix", label: "Sufijo", kind: "text" },
          { key: "label", label: "Etiqueta", kind: "text" },
        ],
      },
    ],
  },
  text: {
    type: "text",
    defaults: { body: "", align: "left", size: "lg" },
    fields: [
      { key: "body", label: "Texto (Markdown)", kind: "markdown" },
      {
        key: "align",
        label: "Alineación",
        kind: "select",
        options: [
          { value: "left", label: "Izquierda" },
          { value: "center", label: "Centro" },
        ],
      },
      {
        key: "size",
        label: "Tamaño",
        kind: "select",
        options: [
          { value: "md", label: "Normal" },
          { value: "lg", label: "Grande" },
          { value: "xl", label: "Enorme" },
        ],
      },
    ],
  },
  contact: {
    type: "contact",
    defaults: {
      body: "¿Tienes un sistema que duele, un producto por lanzar o una idea que necesita lógica? Escríbeme.",
      showForm: true,
      links: [],
    },
    fields: [
      { key: "body", label: "Texto", kind: "textarea" },
      { key: "showForm", label: "Mostrar formulario", kind: "boolean" },
      link("links", "Enlaces extra"),
    ],
  },
};

export function sectionDefaults(type: SectionType): Record<string, unknown> {
  return structuredClone(SECTION_SPECS[type].defaults);
}

/** Merge stored content over defaults so renderers always get every key. */
export function resolveContent<T>(type: SectionType, content: Record<string, unknown>): T {
  return { ...sectionDefaults(type), ...content } as T;
}

/** Parse the admin form back into a content object using the type's field descriptors. */
export function parseContentForm(type: SectionType, form: FormData, current: Record<string, unknown>): Record<string, unknown> {
  const rawJson = form.get("content_json");
  if (typeof rawJson === "string" && rawJson.trim()) {
    try {
      const parsed = JSON.parse(rawJson) as Record<string, unknown>;
      return { ...sectionDefaults(type), ...parsed };
    } catch {
      throw new Error("El JSON no es válido");
    }
  }
  const spec = SECTION_SPECS[type];
  const out: Record<string, unknown> = { ...sectionDefaults(type), ...current };
  for (const f of spec.fields) {
    const name = `c.${f.key}`;
    const values = form.getAll(name);
    const v = values.length ? values[values.length - 1] : null;
    switch (f.kind) {
      case "boolean":
        out[f.key] = v === "1" || v === "on" || v === "true";
        break;
      case "number":
        out[f.key] = v == null || v === "" ? spec.defaults[f.key] : Number(v);
        break;
      case "list":
        out[f.key] = String(v ?? "")
          .split(/\r?\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        break;
      case "objects":
        try {
          out[f.key] = v ? JSON.parse(String(v)) : spec.defaults[f.key];
        } catch {
          out[f.key] = spec.defaults[f.key];
        }
        break;
      default:
        out[f.key] = v == null ? "" : String(v);
    }
  }
  return out;
}
