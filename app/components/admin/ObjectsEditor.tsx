import { useState } from "react";
import type { FieldDef } from "~/lib/sections";
import { ImagePicker } from "./ImagePicker";

type Row = Record<string, unknown>;

interface Props {
  name: string;
  fields: FieldDef[];
  value: Row[] | Row;
  single?: boolean;
  label?: string;
  help?: string;
}

function emptyRow(fields: FieldDef[]): Row {
  const r: Row = {};
  for (const f of fields) r[f.key] = f.kind === "boolean" ? false : f.kind === "number" ? 0 : "";
  return r;
}

/** Edits an array of objects (or a single object) and serializes it as JSON in a hidden input. */
export function ObjectsEditor({ name, fields, value, single, label, help }: Props) {
  const initial: Row[] = single ? [((value as Row) ?? emptyRow(fields))] : Array.isArray(value) ? (value as Row[]) : [];
  const [rows, setRows] = useState<Row[]>(initial.length || single ? initial : []);

  function update(i: number, key: string, v: unknown) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  }
  function move(i: number, dir: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  const serialized = single ? JSON.stringify(rows[0] ?? {}) : JSON.stringify(rows);

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="admin-label">{label}</span>}
      <input type="hidden" name={name} value={serialized} />
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-line bg-ink-2/60 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key} className={f.kind === "textarea" || f.kind === "image" ? "sm:col-span-2" : ""}>
                  <span className="admin-label">{f.label}</span>
                  {f.kind === "image" ? (
                    <ImagePicker name={`${name}__${i}__${f.key}__display`} value={String(row[f.key] ?? "")} compact onChange={(v) => update(i, f.key, v)} />
                  ) : f.kind === "textarea" ? (
                    <textarea className="admin-input min-h-20" value={String(row[f.key] ?? "")} onChange={(e) => update(i, f.key, e.target.value)} />
                  ) : f.kind === "boolean" ? (
                    <input type="checkbox" className="admin-checkbox" checked={Boolean(row[f.key])} onChange={(e) => update(i, f.key, e.target.checked)} />
                  ) : f.kind === "number" ? (
                    <input type="number" className="admin-input" value={String(row[f.key] ?? "")} onChange={(e) => update(i, f.key, Number(e.target.value))} />
                  ) : f.kind === "select" ? (
                    <select className="admin-input" value={String(row[f.key] ?? "")} onChange={(e) => update(i, f.key, e.target.value)}>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input className="admin-input" value={String(row[f.key] ?? "")} onChange={(e) => update(i, f.key, e.target.value)} placeholder={f.placeholder} />
                  )}
                </div>
              ))}
            </div>
            {!single && (
              <div className="mt-3 flex gap-2">
                <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => move(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                  ↓
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn-danger admin-btn-sm ml-auto"
                  onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!single && (
        <button type="button" className="admin-btn admin-btn-outline admin-btn-sm self-start" onClick={() => setRows((prev) => [...prev, emptyRow(fields)])}>
          + Agregar
        </button>
      )}
      {help && <p className="text-xs text-muted/80">{help}</p>}
    </div>
  );
}
