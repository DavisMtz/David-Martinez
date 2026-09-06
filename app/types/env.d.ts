// Secrets are not part of wrangler.jsonc, so declare them here (set with `wrangler secret put` or `.dev.vars`).
interface Env {
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}
