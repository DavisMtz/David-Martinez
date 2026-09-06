import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import { imageUrl } from "~/lib/cloudinary";
import { cx } from "~/lib/utils";
import { useAdmin } from "./context";
import { uploadToCloudinary } from "./upload";

interface Props {
  name: string;
  value?: string | null;
  label?: string;
  compact?: boolean;
  onChange?: (value: string) => void;
  aspect?: string;
}

export function ImagePicker({ name, value, label, compact, onChange, aspect = "16/10" }: Props) {
  const { cloudName, media } = useAdmin();
  const [current, setCurrent] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    setCurrent(value ?? "");
  }, [value]);

  function commit(next: string) {
    setCurrent(next);
    onChange?.(next);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setError(null);
    setProgress(0);
    try {
      const res = await uploadToCloudinary(files[0], { folder: "portfolio", onProgress: setProgress });
      const fd = new FormData();
      fd.set("intent", "register");
      fd.set("payload", JSON.stringify(res));
      fetcher.submit(fd, { method: "post", action: "/admin/media" });
      commit(res.public_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const preview = current ? imageUrl(current, cloudName, { w: 640, crop: "fill" }) : "";

  return (
    <div className={cx("flex flex-col gap-2", compact && "gap-1.5")}>
      {label && <span className="admin-label">{label}</span>}
      <input type="hidden" name={name} value={current} />
      <div className={cx("flex gap-3", compact ? "items-center" : "items-start")}>
        <div
          className={cx(
            "shrink-0 overflow-hidden rounded-lg border border-line bg-ink-3 grid place-items-center",
            compact ? "h-12 w-16" : "w-44 sm:w-56",
          )}
          style={compact ? undefined : { aspectRatio: aspect }}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted/60">sin imagen</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            className="admin-input font-mono text-xs"
            value={current}
            onChange={(e) => commit(e.target.value)}
            placeholder="public_id de Cloudinary o URL"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => fileRef.current?.click()}>
              {progress === null ? "Subir" : `Subiendo ${progress}%`}
            </button>
            <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => setOpen(true)}>
              Biblioteca
            </button>
            {current && (
              <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => commit("")}>
                Quitar
              </button>
            )}
          </div>
          {error && <p className="text-xs text-accent">{error}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="admin-card max-h-[85vh] w-full max-w-4xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Biblioteca de medios</h3>
              <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
            {media.length === 0 ? (
              <p className="text-sm text-muted">Aún no hay imágenes. Sube una con el botón "Subir".</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {media.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={cx(
                      "group overflow-hidden rounded-lg border bg-ink-3 text-left transition",
                      current === m.public_id ? "border-accent" : "border-line hover:border-paper/40",
                    )}
                    onClick={() => {
                      commit(m.public_id);
                      setOpen(false);
                    }}
                  >
                    <img
                      src={imageUrl(m.public_id, cloudName, { w: 300, h: 200, crop: "fill" })}
                      alt={m.alt ?? ""}
                      className="aspect-[3/2] w-full object-cover"
                      loading="lazy"
                    />
                    <span className="block truncate px-2 py-1 font-mono text-[10px] text-muted">{m.public_id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
