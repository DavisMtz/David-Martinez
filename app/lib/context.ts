import { createContext } from "react-router";

/** Cloudflare bindings and execution context, injected by workers/app.ts. */
export interface CloudflareContext {
  env: Env;
  ctx: ExecutionContext;
}

export const cloudflareContext = createContext<CloudflareContext>();
