"use client";

import { useCallback, useEffect, useState } from "react";

export type FieldType = "text" | "number" | "textarea" | "boolean" | "image" | "select";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  step?: string;
}

interface Props {
  resource: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

type Item = Record<string, unknown> & { id: string };

export default function AdminResource({ resource, title, description, fields, defaults }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown>>(defaults);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${resource}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  function resetDraft() {
    setDraft(defaults);
    setEditingId(null);
  }

  async function save() {
    setError(null);
    try {
      const payload = { ...draft };
      const url = editingId ? `/api/admin/${resource}/${editingId}` : `/api/admin/${resource}`;
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      resetDraft();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Удалить запись?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function edit(item: Item) {
    const next: Record<string, unknown> = {};
    for (const f of fields) next[f.key] = item[f.key];
    setDraft(next);
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(file: File, key: string) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/dish-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDraft((d) => ({ ...d, [key]: data.url }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {/* Editor */}
      <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <h2 className="mb-4 font-semibold">{editingId ? "Редактирование" : "Добавить запись"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-sm font-medium text-stone-600">{f.label}</label>
              {f.type === "text" && (
                <input
                  value={(draft[f.key] as string) ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 outline-none focus:border-emerald-500"
                />
              )}
              {f.type === "number" && (
                <input
                  type="number"
                  step={f.step ?? "1"}
                  value={(draft[f.key] as number) ?? 0}
                  onChange={(e) => setDraft({ ...draft, [f.key]: Number(e.target.value) })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 outline-none focus:border-emerald-500"
                />
              )}
              {f.type === "textarea" && (
                <textarea
                  rows={2}
                  value={(draft[f.key] as string) ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 outline-none focus:border-emerald-500"
                />
              )}
              {f.type === "boolean" && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(draft[f.key])}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.checked })}
                  />
                  <span className="text-stone-600">да</span>
                </label>
              )}
              {f.type === "select" && (
                <select
                  value={(draft[f.key] as string) ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  className="w-full rounded-lg border border-stone-200 px-3 py-2 outline-none focus:border-emerald-500"
                >
                  <option value="">—</option>
                  {(f.options ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
              {f.type === "image" && (
                <div className="space-y-2">
                  <input
                    value={(draft[f.key] as string) ?? ""}
                    onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                    placeholder="URL изображения"
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 outline-none focus:border-emerald-500"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, f.key);
                    }}
                    className="block text-sm text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-emerald-700"
                  />
                  {uploading && <p className="text-xs text-stone-400">Загрузка…</p>}
                  {Boolean(draft[f.key]) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft[f.key] as string}
                      alt="превью"
                      className="h-28 w-28 rounded-lg object-cover ring-1 ring-stone-200"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
            <button type="button" onClick={resetDraft} className="rounded-lg border border-stone-200 px-5 py-2">
              Отмена
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
        {loading ? (
          <p className="p-5 text-sm text-stone-400">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="p-5 text-sm text-stone-400">Нет записей</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500">
                {fields.map((f) => (
                  <th key={f.key} className="px-4 py-3 font-medium">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-stone-50">
                  {fields.map((f) => (
                    <td key={f.key} className="px-4 py-3 align-top">
                      {renderCell(f, item[f.key])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button onClick={() => edit(item)} className="mr-3 text-emerald-700 hover:underline">
                      ред.
                    </button>
                    <button onClick={() => remove(item.id)} className="text-red-600 hover:underline">
                      удал.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function renderCell(f: FieldDef, value: unknown) {
  if (f.type === "boolean") return value ? "✓" : "—";
  if (f.type === "image") {
    return value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={value as string} alt="" className="h-12 w-12 rounded object-cover" />
    ) : (
      "—"
    );
  }
  if (f.type === "select") {
    const opt = f.options?.find((o) => o.value === value);
    return opt?.label ?? (value as string) ?? "—";
  }
  const str = String(value ?? "");
  return str.length > 60 ? str.slice(0, 60) + "…" : str || "—";
}
