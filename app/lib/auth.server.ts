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

export async function verifyPassword(env: Env, candidate: string): Promise<boolean> {
  const expected = env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  // Compare HMACs of both values so the comparison is constant-time regardless of length.
  const [a, b] = await Promise.all([sign(env.SESSION_SECRET, candidate), sign(env.SESSION_SECRET, expected)]);
  return timingSafeEqual(a, b);
}

export async function createSessionCookie(env: Env): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify({ iat: Date.now(), exp: Date.now() + MAX_AGE * 1000, n: crypto.randomUUID() })));
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
    const data = JSON.parse(fromB64url(payload)) as { exp: number };
    return typeof data.exp === "number" && data.exp > Date.now();
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
