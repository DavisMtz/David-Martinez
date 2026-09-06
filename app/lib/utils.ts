export function uid(prefix = ""): string {
  const raw = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return prefix ? `${prefix}_${raw}` : raw;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function parseList(value: FormDataEntryValue | null | undefined): string[] {
  if (!value) return [];
  return String(value)
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function str(value: FormDataEntryValue | null | undefined, fallback = ""): string {
  if (value == null) return fallback;
  return String(value).trim();
}

export function nullable(value: FormDataEntryValue | null | undefined): string | null {
  const s = str(value);
  return s.length ? s : null;
}

export function bool(value: FormDataEntryValue | null | undefined): boolean {
  if (value == null) return false;
  const s = String(value).toLowerCase();
  return s === "on" || s === "true" || s === "1";
}

export function int(value: FormDataEntryValue | null | undefined, fallback = 0): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function formatDate(iso: string | null | undefined, locale = "es-MX"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export function formatPeriod(start: string | null, end: string | null): string {
  const fmt = (v: string | null) => {
    if (!v) return "";
    const [y, m] = v.split("-");
    if (!m) return y;
    const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${months[Number(m) - 1] ?? m} ${y}`;
  };
  if (!start && !end) return "";
  const s = fmt(start);
  const e = end ? fmt(end) : "actualidad";
  if (!s) return e;
  return `${s} — ${e}`;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Reads a Toggle (hidden "0" + checkbox "1") or plain checkbox from FormData. */
export function formBool(form: FormData, name: string): boolean {
  return form.getAll(name).some((v) => v === "1" || v === "on" || v === "true");
}

export function safeNext(value: unknown, fallback = "/admin"): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/admin") && !s.startsWith("//") ? s : fallback;
}
