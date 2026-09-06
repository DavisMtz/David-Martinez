-- Esquema inicial del portafolio de David Martínez.
-- Todo el contenido público es editable desde /admin.

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,                       -- JSON
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Secciones modulares de la página principal (orden, visibilidad y contenido por tipo).
CREATE TABLE IF NOT EXISTS sections (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,                        -- hero | about | projects | experience | skills | gallery | marquee | stats | text | contact
  eyebrow    TEXT,
  title      TEXT,
  subtitle   TEXT,
  content    TEXT NOT NULL DEFAULT '{}',           -- JSON específico del tipo
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible    INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(sort_order);

CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  tagline     TEXT,
  description TEXT,                                -- Markdown
  role        TEXT,
  year        TEXT,
  status      TEXT NOT NULL DEFAULT 'live',        -- live | building | archived | concept
  url         TEXT,
  repo_url    TEXT,
  tags        TEXT NOT NULL DEFAULT '[]',          -- JSON string[]
  stack       TEXT NOT NULL DEFAULT '[]',          -- JSON string[]
  cover_image TEXT,                                -- Cloudinary public_id o URL absoluta
  gallery     TEXT NOT NULL DEFAULT '[]',          -- JSON string[] (public_ids o URLs)
  accent      TEXT,                                -- color hex del proyecto
  featured    INTEGER NOT NULL DEFAULT 0,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  visible     INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(sort_order);

CREATE TABLE IF NOT EXISTS experiences (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL DEFAULT 'work',       -- work | education | award | community
  organization TEXT NOT NULL,
  role         TEXT NOT NULL,
  location     TEXT,
  start_date   TEXT,                               -- YYYY o YYYY-MM
  end_date     TEXT,                               -- NULL = actualidad
  description  TEXT,
  highlights   TEXT NOT NULL DEFAULT '[]',         -- JSON string[]
  url          TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  visible      INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS skills (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  category   TEXT NOT NULL,                        -- frontend | backend | cloud | data | design | product | tools
  level      INTEGER NOT NULL DEFAULT 3,           -- 1..5
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS media (
  id         TEXT PRIMARY KEY,
  public_id  TEXT NOT NULL UNIQUE,                 -- Cloudinary public_id
  url        TEXT NOT NULL,                        -- secure_url
  width      INTEGER,
  height     INTEGER,
  format     TEXT,
  bytes      INTEGER,
  resource_type TEXT NOT NULL DEFAULT 'image',
  alt        TEXT,
  caption    TEXT,
  tags       TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  body       TEXT NOT NULL,
  ip         TEXT,
  user_agent TEXT,
  read       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
