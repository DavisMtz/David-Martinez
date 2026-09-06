/** Client-safe helpers to build optimized Cloudinary delivery URLs. */

export interface ImageOptions {
  w?: number;
  h?: number;
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale" | "pad";
  gravity?: "auto" | "face" | "faces" | "center" | "north" | "south";
  ar?: string;
  quality?: string;
  format?: string;
  dpr?: string;
  effect?: string;
  raw?: string;
}

export function isAbsoluteUrl(value: string): boolean {
  return /^(https?:)?\/\//i.test(value) || value.startsWith("data:");
}

export function buildTransform(opts: ImageOptions = {}): string {
  const parts: string[] = [];
  parts.push(`f_${opts.format ?? "auto"}`);
  parts.push(`q_${opts.quality ?? "auto"}`);
  if (opts.w) parts.push(`w_${opts.w}`);
  if (opts.h) parts.push(`h_${opts.h}`);
  if (opts.ar) parts.push(`ar_${opts.ar}`);
  if (opts.w || opts.h || opts.ar) {
    parts.push(`c_${opts.crop ?? "fill"}`);
    if ((opts.crop ?? "fill") === "fill" || opts.crop === "thumb") parts.push(`g_${opts.gravity ?? "auto"}`);
  }
  if (opts.dpr) parts.push(`dpr_${opts.dpr}`);
  if (opts.effect) parts.push(`e_${opts.effect}`);
  if (opts.raw) parts.push(opts.raw);
  return parts.join(",");
}

/**
 * Resolve an image reference (Cloudinary public_id, Cloudinary URL or any absolute URL)
 * into a delivery URL with the requested transformations.
 */
export function imageUrl(
  ref: string | null | undefined,
  cloudName: string,
  opts: ImageOptions = {},
): string {
  if (!ref) return "";
  const transform = buildTransform(opts);
  if (isAbsoluteUrl(ref)) {
    const marker = "/image/upload/";
    const idx = ref.indexOf(marker);
    if (ref.includes("res.cloudinary.com") && idx !== -1) {
      const rest = ref.slice(idx + marker.length);
      // Strip an existing transformation segment (anything before a version or the public id)
      const cleaned = rest.replace(/^(?:[a-z]{1,3}_[^/]+\/)+/, "");
      return `${ref.slice(0, idx)}${marker}${transform}/${cleaned}`;
    }
    return ref;
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${ref}`;
}

export function srcSet(
  ref: string | null | undefined,
  cloudName: string,
  widths: number[],
  opts: ImageOptions = {},
): string {
  if (!ref || isAbsoluteUrl(ref) && !ref.includes("res.cloudinary.com")) return "";
  return widths.map((w) => `${imageUrl(ref, cloudName, { ...opts, w })} ${w}w`).join(", ");
}

export function videoUrl(publicId: string, cloudName: string): string {
  if (isAbsoluteUrl(publicId)) return publicId;
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto/${publicId}`;
}
