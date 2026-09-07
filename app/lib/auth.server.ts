import { redirect } from "react-router";

const COOKIE = "dm_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(secret: string, payload: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return b64url(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/**
 * Contraseña guardada en la base de datos. Mientras no exista, vale la del
 * secreto ADMIN_PASSWORD, que sirve para el primer acceso.
 */
interface StoredAuth {
  hash: string;
  salt: string;
  iterations: number;
  /** Sube al cambiar la contraseña: invalida las sesiones abiertas en otros equipos. */
  tokenVersion: number;
  updatedAt: string;
}

/** OWASP recomienda más, pero el Worker tiene un tope de CPU por petición. */
const PBKDF2_ITERATIONS = 100_000;

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function derive(password: string, salt: string, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc.encode(salt), iterations, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(bits);
}

export async function readStoredAuth(env: Env): Promise<StoredAuth | null> {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_auth'").first<{ value: string }>();
  if (!row?.value) return null;
  try {
    const parsed = JSON.parse(row.value) as StoredAuth;
    if (!parsed.hash || !parsed.salt) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Guarda una contraseña nueva y deja fuera las sesiones de otros equipos. */
export async function storePassword(env: Env, password: string): Promise<StoredAuth> {
  const current = await readStoredAuth(env);
  const salt = crypto.randomUUID().replace(/-/g, "");
  const next: StoredAuth = {
    salt,
    iterations: PBKDF2_ITERATIONS,
    hash: await derive(password, salt, PBKDF2_ITERATIONS),
    tokenVersion: (current?.tokenVersion ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  await env.DB.prepare(
    "INSERT INTO settings (key, value, updated_at) VALUES ('admin_auth', ?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
  )
    .bind(JSON.stringify(next), next.updatedAt)
    .run();
  return next;
}

/** ¿Sigue usándose la contraseña inicial del secreto? */
export async function isUsingBootstrapPassword(env: Env): Promise<boolean> {
  return (await readStoredAuth(env)) === null;
}

export async function verifyPassword(env: Env, candidate: string): Promise<boolean> {
  if (!candidate) return false;

  const stored = await readStoredAuth(env);
  if (stored) {
    const hash = await derive(candidate, stored.salt, stored.iterations);
    return timingSafeEqual(hash, stored.hash);
  }

  // Todavía no se ha cambiado: vale la del secreto.
  const expected = env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Se comparan HMACs para que el tiempo no dependa de la longitud.
  const [a, b] = await Promise.all([sign(env.SESSION_SECRET, candidate), sign(env.SESSION_SECRET, expected)]);
  return timingSafeEqual(a, b);
}

export async function createSessionCookie(env: Env, tokenVersion?: number): Promise<string> {
  const v = tokenVersion ?? (await readStoredAuth(env))?.tokenVersion ?? 0;
  const payload = b64url(
    enc.encode(JSON.stringify({ iat: Date.now(), exp: Date.now() + MAX_AGE * 1000, v, n: crypto.randomUUID() })),
  );
  const sig = await sign(env.SESSION_SECRET, payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function isAuthenticated(request: Request, env: Env): Promise<boolean> {
  if (!env.SESSION_SECRET) return false;
  const raw = readCookie(request, COOKIE);
  if (!raw) return false;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return false;
  const expected = await sign(env.SESSION_SECRET, payload);
  if (!timingSafeEqual(expected, sig)) return false;
  try {
    const data = JSON.parse(fromB64url(payload)) as { exp: number; v?: number };
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return false;
    // Si la contraseña cambió después de emitirse esta cookie, ya no vale.
    const expectedVersion = (await readStoredAuth(env))?.tokenVersion ?? 0;
    return (data.v ?? 0) === expectedVersion;
  } catch {
    return false;
  }
}

export async function requireAdmin(request: Request, env: Env): Promise<void> {
  if (await isAuthenticated(request, env)) return;
  const url = new URL(request.url);
  const next = encodeURIComponent(url.pathname + url.search);
  throw redirect(`/admin/login?next=${next}`);
}
