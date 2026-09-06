import { useState } from "react";
import type { FieldDef } from "~/lib/sections";
import { SECTION_SPECS, resolveContent } from "~/lib/sections";
import type { SectionType } from "~/lib/types";
import { Field, Input, Select, Textarea, Toggle } from "./ui";
import { ImagePicker } from "./ImagePicker";
import { ObjectsEditor } from "./ObjectsEditor";

interface Props {
  type: SectionType;
  content: Record<string, unknown>;
}

function renderField(f: FieldDef, value: unknown, defaults: Record<string, unknown>) {
  const name = `c.${f.key}`;
  switch (f.kind) {
    case "text":
    case "color":
      return (
        <Field key={f.key} label={f.label} help={f.help}>
          <Input name={name} type={f.kind === "color" ? "text" : "text"} defaultValue={String(value ?? "")} placeholder={f.placeholder} />
        </Field>
      );
    case "textarea":
      return (
        <Field key={f.key} label={f.label} help={f.help}>
          <Textarea name={name} defaultValue={String(value ?? "")} />
        </Field>
      );
    case "markdown":
      return (
        <Field key={f.key} label={f.label} help={f.help ?? "Acepta Markdown: **negritas**, _cursivas_, listas, enlaces."}>
          <Textarea name={name} defaultValue={String(value ?? "")} className="min-h-48 font-mono text-sm" />
        </Field>
      );
    case "number":
      return (
        <Field key={f.key} label={f.label} help={f.help}>
          <Input name={name} type="number" defaultValue={String(value ?? "")} />
        </Field>
      );
    case "boolean":
      return <Toggle key={f.key} name={name} label={f.label} defaultChecked={Boolean(value)} help={f.help} />;
    case "select":
      return (
        <Field key={f.key} label={f.label} help={f.help}>
          <Select name={name} defaultValue={String(value ?? "")}>
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "image":
      return <ImagePicker key={f.key} name={name} value={String(value ?? "")} label={f.label} />;
    case "list":
      return (
        <Field key={f.key} label={f.label} help={f.help ?? "Un elemento por línea."}>
          <Textarea name={name} defaultValue={Array.isArray(value) ? (value as string[]).join("\n") : ""} className="font-mono text-sm" />
        </Field>
      );
    case "objects": {
      const single = !Array.isArray(defaults[f.key]);
      return (
        <ObjectsEditor
          key={f.key}
          name={name}
          label={f.label}
          help={f.help}
          fields={f.fields ?? []}
          value={(value as Record<string, unknown>[] | Record<string, unknown>) ?? (single ? {} : [])}
          single={single}
        />
      );
    }
  }
}

export function SectionContentFields({ type, content }: Props) {
  const spec = SECTION_SPECS[type];
  const resolved = resolveContent<Record<string, unknown>>(type, content);
  const [raw, setRaw] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="admin-eyebrow">Contenido · {spec.type}</p>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" className="admin-checkbox" checked={raw} onChange={(e) => setRaw(e.target.checked)} />
          Editar JSON directamente
        </label>
      </div>
      {raw ? (
        <Field label="JSON" help="Modo avanzado: el objeto completo de contenido de la sección.">
          <Textarea name="content_json" defaultValue={JSON.stringify(resolved, null, 2)} className="min-h-80 font-mono text-xs" />
        </Field>
      ) : (
        <>
          <input type="hidden" name="content_mode" value="fields" />
          {spec.fields.map((f) => renderField(f, resolved[f.key], spec.defaults))}
        </>
      )}
    </div>
  );
}
