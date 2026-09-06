import type {
  Experience,
  MediaItem,
  Message,
  Project,
  Section,
  SiteSettings,
  Skill,
} from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { parseJson, uid } from "./utils";

type Row = Record<string, unknown>;

const now = () => new Date().toISOString();

function rowToSection(r: Row): Section {
  return {
    id: String(r.id),
    type: r.type as Section["type"],
    eyebrow: (r.eyebrow as string | null) ?? null,
    title: (r.title as string | null) ?? null,
    subtitle: (r.subtitle as string | null) ?? null,
    content: parseJson<Record<string, unknown>>(r.content, {}),
    sort_order: Number(r.sort_order ?? 0),
    visible: Number(r.visible ?? 1) === 1,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function rowToProject(r: Row): Project {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    role: (r.role as string | null) ?? null,
    year: (r.year as string | null) ?? null,
    status: (r.status as Project["status"]) ?? "live",
    url: (r.url as string | null) ?? null,
    repo_url: (r.repo_url as string | null) ?? null,
    tags: parseJson<string[]>(r.tags, []),
    stack: parseJson<string[]>(r.stack, []),
    cover_image: (r.cover_image as string | null) ?? null,
    gallery: parseJson<string[]>(r.gallery, []),
    accent: (r.accent as string | null) ?? null,
    featured: Number(r.featured ?? 0) === 1,
    sort_order: Number(r.sort_order ?? 0),
    visible: Number(r.visible ?? 1) === 1,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function rowToExperience(r: Row): Experience {
  return {
    id: String(r.id),
    kind: (r.kind as Experience["kind"]) ?? "work",
    organization: String(r.organization),
    role: String(r.role),
    location: (r.location as string | null) ?? null,
    start_date: (r.start_date as string | null) ?? null,
    end_date: (r.end_date as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    highlights: parseJson<string[]>(r.highlights, []),
    url: (r.url as string | null) ?? null,
    sort_order: Number(r.sort_order ?? 0),
    visible: Number(r.visible ?? 1) === 1,
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function rowToSkill(r: Row): Skill {
  return {
    id: String(r.id),
    name: String(r.name),
    category: (r.category as Skill["category"]) ?? "tools",
    level: Number(r.level ?? 3),
    sort_order: Number(r.sort_order ?? 0),
    visible: Number(r.visible ?? 1) === 1,
  };
}

function rowToMedia(r: Row): MediaItem {
  return {
    id: String(r.id),
    public_id: String(r.public_id),
    url: String(r.url),
    width: r.width == null ? null : Number(r.width),
    height: r.height == null ? null : Number(r.height),
    format: (r.format as string | null) ?? null,
    bytes: r.bytes == null ? null : Number(r.bytes),
    resource_type: String(r.resource_type ?? "image"),
    alt: (r.alt as string | null) ?? null,
    caption: (r.caption as string | null) ?? null,
    tags: parseJson<string[]>(r.tags, []),
    created_at: String(r.created_at ?? ""),
  };
}

function rowToMessage(r: Row): Message {
  return {
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    subject: (r.subject as string | null) ?? null,
    body: String(r.body),
    ip: (r.ip as string | null) ?? null,
    user_agent: (r.user_agent as string | null) ?? null,
    read: Number(r.read ?? 0) === 1,
    created_at: String(r.created_at ?? ""),
  };
}

export class Repo {
  constructor(private readonly d1: D1Database) {}

  // ---------- Settings ----------
  async getSettings(): Promise<SiteSettings> {
    const row = await this.d1.prepare("SELECT value FROM settings WHERE key = 'site'").first<Row>();
    const stored = parseJson<Partial<SiteSettings>>(row?.value, {});
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  async saveSettings(patch: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const next = { ...current, ...patch };
    await this.d1
      .prepare(
        "INSERT INTO settings (key, value, updated_at) VALUES ('site', ?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      )
      .bind(JSON.stringify(next), now())
      .run();
    return next;
  }

  // ---------- Sections ----------
  async listSections(visibleOnly = false): Promise<Section[]> {
    const sql = `SELECT * FROM sections ${visibleOnly ? "WHERE visible = 1" : ""} ORDER BY sort_order ASC, created_at ASC`;
    const { results } = await this.d1.prepare(sql).all<Row>();
    return results.map(rowToSection);
  }

  async getSection(id: string): Promise<Section | null> {
    const row = await this.d1.prepare("SELECT * FROM sections WHERE id = ?1").bind(id).first<Row>();
    return row ? rowToSection(row) : null;
  }

  async createSection(input: Pick<Section, "type"> & Partial<Section>): Promise<Section> {
    const id = input.id ?? uid("sec");
    const max = await this.d1.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM sections").first<Row>();
    const order = input.sort_order ?? Number(max?.m ?? 0) + 10;
    await this.d1
      .prepare(
        "INSERT INTO sections (id, type, eyebrow, title, subtitle, content, sort_order, visible) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
      )
      .bind(
        id,
        input.type,
        input.eyebrow ?? null,
        input.title ?? null,
        input.subtitle ?? null,
        JSON.stringify(input.content ?? {}),
        order,
        input.visible === false ? 0 : 1,
      )
      .run();
    return (await this.getSection(id))!;
  }

  async updateSection(id: string, patch: Partial<Section>): Promise<void> {
    const current = await this.getSection(id);
    if (!current) throw new Error("Sección no encontrada");
    const next = { ...current, ...patch };
    await this.d1
      .prepare(
        "UPDATE sections SET type = ?2, eyebrow = ?3, title = ?4, subtitle = ?5, content = ?6, sort_order = ?7, visible = ?8, updated_at = ?9 WHERE id = ?1",
      )
      .bind(
        id,
        next.type,
        next.eyebrow,
        next.title,
        next.subtitle,
        JSON.stringify(next.content ?? {}),
        next.sort_order,
        next.visible ? 1 : 0,
        now(),
      )
      .run();
  }

  async deleteSection(id: string): Promise<void> {
    await this.d1.prepare("DELETE FROM sections WHERE id = ?1").bind(id).run();
  }

  async reorderSections(ids: string[]): Promise<void> {
    await this.reorder("sections", ids);
  }

  // ---------- Projects ----------
  async listProjects(opts: { visibleOnly?: boolean; featuredOnly?: boolean; limit?: number } = {}): Promise<Project[]> {
    const where: string[] = [];
    if (opts.visibleOnly) where.push("visible = 1");
    if (opts.featuredOnly) where.push("featured = 1");
    const sql = `SELECT * FROM projects ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY sort_order ASC, created_at DESC ${opts.limit ? `LIMIT ${Number(opts.limit)}` : ""}`;
    const { results } = await this.d1.prepare(sql).all<Row>();
    return results.map(rowToProject);
  }

  async getProject(id: string): Promise<Project | null> {
    const row = await this.d1.prepare("SELECT * FROM projects WHERE id = ?1").bind(id).first<Row>();
    return row ? rowToProject(row) : null;
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const row = await this.d1.prepare("SELECT * FROM projects WHERE slug = ?1").bind(slug).first<Row>();
    return row ? rowToProject(row) : null;
  }

  async saveProject(input: Partial<Project> & { title: string; slug: string }): Promise<Project> {
    const existing = input.id ? await this.getProject(input.id) : null;
    const id = existing?.id ?? input.id ?? uid("prj");
    const base: Project = existing ?? {
      id,
      slug: input.slug,
      title: input.title,
      tagline: null,
      description: null,
      role: null,
      year: null,
      status: "live",
      url: null,
      repo_url: null,
      tags: [],
      stack: [],
      cover_image: null,
      gallery: [],
      accent: null,
      featured: false,
      sort_order: 0,
      visible: true,
      created_at: now(),
      updated_at: now(),
    };
    if (!existing) {
      const max = await this.d1.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM projects").first<Row>();
      base.sort_order = Number(max?.m ?? 0) + 10;
    }
    const p: Project = { ...base, ...input, id, updated_at: now() };
    await this.d1
      .prepare(
        `INSERT INTO projects (id, slug, title, tagline, description, role, year, status, url, repo_url, tags, stack, cover_image, gallery, accent, featured, sort_order, visible, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)
         ON CONFLICT(id) DO UPDATE SET slug = excluded.slug, title = excluded.title, tagline = excluded.tagline, description = excluded.description, role = excluded.role, year = excluded.year, status = excluded.status, url = excluded.url, repo_url = excluded.repo_url, tags = excluded.tags, stack = excluded.stack, cover_image = excluded.cover_image, gallery = excluded.gallery, accent = excluded.accent, featured = excluded.featured, sort_order = excluded.sort_order, visible = excluded.visible, updated_at = excluded.updated_at`,
      )
      .bind(
        p.id,
        p.slug,
        p.title,
        p.tagline,
        p.description,
        p.role,
        p.year,
        p.status,
        p.url,
        p.repo_url,
        JSON.stringify(p.tags ?? []),
        JSON.stringify(p.stack ?? []),
        p.cover_image,
        JSON.stringify(p.gallery ?? []),
        p.accent,
        p.featured ? 1 : 0,
        p.sort_order,
        p.visible ? 1 : 0,
        p.created_at,
        p.updated_at,
      )
      .run();
    return (await this.getProject(id))!;
  }

  async deleteProject(id: string): Promise<void> {
    await this.d1.prepare("DELETE FROM projects WHERE id = ?1").bind(id).run();
  }

  async reorderProjects(ids: string[]): Promise<void> {
    await this.reorder("projects", ids);
  }

  // ---------- Experiences ----------
  async listExperiences(visibleOnly = false, kinds?: string[]): Promise<Experience[]> {
    const where: string[] = [];
    const binds: unknown[] = [];
    if (visibleOnly) where.push("visible = 1");
    if (kinds && kinds.length) {
      where.push(`kind IN (${kinds.map((_, i) => `?${i + 1}`).join(",")})`);
      binds.push(...kinds);
    }
    const sql = `SELECT * FROM experiences ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY sort_order ASC, COALESCE(end_date, '9999') DESC, start_date DESC`;
    const { results } = await this.d1.prepare(sql).bind(...binds).all<Row>();
    return results.map(rowToExperience);
  }

  async getExperience(id: string): Promise<Experience | null> {
    const row = await this.d1.prepare("SELECT * FROM experiences WHERE id = ?1").bind(id).first<Row>();
    return row ? rowToExperience(row) : null;
  }

  async saveExperience(input: Partial<Experience> & { organization: string; role: string }): Promise<Experience> {
    const existing = input.id ? await this.getExperience(input.id) : null;
    const id = existing?.id ?? input.id ?? uid("exp");
    const base: Experience = existing ?? {
      id,
      kind: "work",
      organization: input.organization,
      role: input.role,
      location: null,
      start_date: null,
      end_date: null,
      description: null,
      highlights: [],
      url: null,
      sort_order: 0,
      visible: true,
      created_at: now(),
      updated_at: now(),
    };
    if (!existing) {
      const max = await this.d1.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM experiences").first<Row>();
      base.sort_order = Number(max?.m ?? 0) + 10;
    }
    const e: Experience = { ...base, ...input, id, updated_at: now() };
    await this.d1
      .prepare(
        `INSERT INTO experiences (id, kind, organization, role, location, start_date, end_date, description, highlights, url, sort_order, visible, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
         ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, organization = excluded.organization, role = excluded.role, location = excluded.location, start_date = excluded.start_date, end_date = excluded.end_date, description = excluded.description, highlights = excluded.highlights, url = excluded.url, sort_order = excluded.sort_order, visible = excluded.visible, updated_at = excluded.updated_at`,
      )
      .bind(
        e.id,
        e.kind,
        e.organization,
        e.role,
        e.location,
        e.start_date,
        e.end_date,
        e.description,
        JSON.stringify(e.highlights ?? []),
        e.url,
        e.sort_order,
        e.visible ? 1 : 0,
        e.created_at,
        e.updated_at,
      )
      .run();
    return (await this.getExperience(id))!;
  }

  async deleteExperience(id: string): Promise<void> {
    await this.d1.prepare("DELETE FROM experiences WHERE id = ?1").bind(id).run();
  }

  async reorderExperiences(ids: string[]): Promise<void> {
    await this.reorder("experiences", ids);
  }

  // ---------- Skills ----------
  async listSkills(visibleOnly = false): Promise<Skill[]> {
    const sql = `SELECT * FROM skills ${visibleOnly ? "WHERE visible = 1" : ""} ORDER BY category ASC, sort_order ASC, level DESC, name ASC`;
    const { results } = await this.d1.prepare(sql).all<Row>();
    return results.map(rowToSkill);
  }

  async saveSkill(input: Partial<Skill> & { name: string; category: Skill["category"] }): Promise<void> {
    const id = input.id ?? uid("skl");
    await this.d1
      .prepare(
        `INSERT INTO skills (id, name, category, level, sort_order, visible) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, category = excluded.category, level = excluded.level, sort_order = excluded.sort_order, visible = excluded.visible`,
      )
      .bind(id, input.name, input.category, input.level ?? 3, input.sort_order ?? 0, input.visible === false ? 0 : 1)
      .run();
  }

  async deleteSkill(id: string): Promise<void> {
    await this.d1.prepare("DELETE FROM skills WHERE id = ?1").bind(id).run();
  }

  // ---------- Media ----------
  async listMedia(limit = 500): Promise<MediaItem[]> {
    const { results } = await this.d1
      .prepare("SELECT * FROM media ORDER BY created_at DESC LIMIT ?1")
      .bind(limit)
      .all<Row>();
    return results.map(rowToMedia);
  }

  async getMediaByPublicId(publicId: string): Promise<MediaItem | null> {
    const row = await this.d1.prepare("SELECT * FROM media WHERE public_id = ?1").bind(publicId).first<Row>();
    return row ? rowToMedia(row) : null;
  }

  async saveMedia(input: Omit<Partial<MediaItem>, "id"> & { public_id: string; url: string }): Promise<MediaItem> {
    const existing = await this.getMediaByPublicId(input.public_id);
    const id = existing?.id ?? uid("med");
    await this.d1
      .prepare(
        `INSERT INTO media (id, public_id, url, width, height, format, bytes, resource_type, alt, caption, tags)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
         ON CONFLICT(public_id) DO UPDATE SET url = excluded.url, width = excluded.width, height = excluded.height, format = excluded.format, bytes = excluded.bytes, resource_type = excluded.resource_type, alt = COALESCE(excluded.alt, media.alt), caption = COALESCE(excluded.caption, media.caption), tags = excluded.tags`,
      )
      .bind(
        id,
        input.public_id,
        input.url,
        input.width ?? null,
        input.height ?? null,
        input.format ?? null,
        input.bytes ?? null,
        input.resource_type ?? "image",
        input.alt ?? existing?.alt ?? null,
        input.caption ?? existing?.caption ?? null,
        JSON.stringify(input.tags ?? existing?.tags ?? []),
      )
      .run();
    return (await this.getMediaByPublicId(input.public_id))!;
  }

  async updateMediaMeta(id: string, alt: string | null, caption: string | null): Promise<void> {
    await this.d1.prepare("UPDATE media SET alt = ?2, caption = ?3 WHERE id = ?1").bind(id, alt, caption).run();
  }

  async deleteMedia(id: string): Promise<MediaItem | null> {
    const row = await this.d1.prepare("SELECT * FROM media WHERE id = ?1").bind(id).first<Row>();
    if (!row) return null;
    await this.d1.prepare("DELETE FROM media WHERE id = ?1").bind(id).run();
    return rowToMedia(row);
  }

  // ---------- Messages ----------
  async listMessages(limit = 200): Promise<Message[]> {
    const { results } = await this.d1
      .prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?1")
      .bind(limit)
      .all<Row>();
    return results.map(rowToMessage);
  }

  async countUnread(): Promise<number> {
    const row = await this.d1.prepare("SELECT COUNT(*) AS c FROM messages WHERE read = 0").first<Row>();
    return Number(row?.c ?? 0);
  }

  async addMessage(input: { name: string; email: string; subject?: string | null; body: string; ip?: string | null; user_agent?: string | null }): Promise<void> {
    await this.d1
      .prepare("INSERT INTO messages (id, name, email, subject, body, ip, user_agent) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
      .bind(uid("msg"), input.name, input.email, input.subject ?? null, input.body, input.ip ?? null, input.user_agent ?? null)
      .run();
  }

  async setMessageRead(id: string, read: boolean): Promise<void> {
    await this.d1.prepare("UPDATE messages SET read = ?2 WHERE id = ?1").bind(id, read ? 1 : 0).run();
  }

  async deleteMessage(id: string): Promise<void> {
    await this.d1.prepare("DELETE FROM messages WHERE id = ?1").bind(id).run();
  }

  // ---------- Stats ----------
  async counts(): Promise<{ sections: number; projects: number; experiences: number; skills: number; media: number; messages: number; unread: number }> {
    const q = async (table: string) => {
      const row = await this.d1.prepare(`SELECT COUNT(*) AS c FROM ${table}`).first<Row>();
      return Number(row?.c ?? 0);
    };
    const [sections, projects, experiences, skills, media, messages, unread] = await Promise.all([
      q("sections"),
      q("projects"),
      q("experiences"),
      q("skills"),
      q("media"),
      q("messages"),
      this.countUnread(),
    ]);
    return { sections, projects, experiences, skills, media, messages, unread };
  }

  // ---------- helpers ----------
  private async reorder(table: "sections" | "projects" | "experiences", ids: string[]): Promise<void> {
    if (!ids.length) return;
    const stmts = ids.map((id, i) =>
      this.d1.prepare(`UPDATE ${table} SET sort_order = ?2 WHERE id = ?1`).bind(id, (i + 1) * 10),
    );
    await this.d1.batch(stmts);
  }
}

export function repo(env: Env): Repo {
  return new Repo(env.DB);
}
