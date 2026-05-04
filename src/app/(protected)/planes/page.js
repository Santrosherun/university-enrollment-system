"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-app-border bg-app-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-foreground">{title}</div>
            <div className="mt-1 text-sm text-app-muted">
              Un plan pertenece a un programa académico.
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default function PlanesPage() {
  const [programas, setProgramas] = useState([]);
  const [selectedProgramaId, setSelectedProgramaId] = useState("");

  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return planes;
    return planes.filter(
      (p) =>
        p.codigo?.toLowerCase().includes(q) ||
        p.nombre?.toLowerCase().includes(q) ||
        p.version?.toLowerCase().includes(q),
    );
  }, [planes, query]);

  async function loadProgramas() {
    const res = await fetch("/api/programas");
    if (!res.ok) return;
    const payload = await res.json();
    const list = payload.items ?? [];
    setProgramas(list);
    if (!selectedProgramaId && list[0]?.id) setSelectedProgramaId(list[0].id);
  }

  async function loadPlanes(programaId) {
    setLoading(true);
    setError(null);
    const qs = programaId ? `?programaId=${encodeURIComponent(programaId)}` : "";
    const res = await fetch(`/api/planes${qs}`);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.message ?? "No se pudieron cargar los planes.");
      setLoading(false);
      return;
    }
    const payload = await res.json();
    setPlanes(payload.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadProgramas();
  }, []);

  useEffect(() => {
    if (!selectedProgramaId) return;
    loadPlanes(selectedProgramaId);
  }, [selectedProgramaId]);

  async function save(form) {
    const isEdit = Boolean(editing?.id);
    const url = isEdit ? `/api/planes/${editing.id}` : "/api/planes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo guardar el plan.");
    }

    await loadPlanes(form.programaId);
    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(item) {
    const res = await fetch(`/api/planes/${item.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ activo: !item.activo }),
    });
    if (!res.ok) return;
    await loadPlanes(selectedProgramaId);
  }

  const selectedPrograma = programas.find((p) => p.id === selectedProgramaId);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Planes de estudio
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Selecciona un programa y administra sus planes.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          disabled={!selectedProgramaId}
        >
          Nuevo plan
        </Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1 lg:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Programa
            </label>
            <select
              value={selectedProgramaId}
              onChange={(e) => setSelectedProgramaId(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              {programas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.codigo} — {p.nombre}
                </option>
              ))}
            </select>
            {selectedPrograma ? (
              <div className="text-xs text-app-muted">
                Modalidad:{" "}
                <span className="font-medium text-foreground">
                  {selectedPrograma.modalidad}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm font-medium text-foreground">Buscar</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Código, nombre o versión..."
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-app-muted">Cargando...</div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-app-muted">
                <tr className="border-b border-app-border">
                  <th className="py-3 pr-4">Código</th>
                  <th className="py-3 pr-4">Nombre</th>
                  <th className="py-3 pr-4">Versión</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-app-border/70">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {p.codigo}
                    </td>
                    <td className="py-3 pr-4 text-foreground">{p.nombre}</td>
                    <td className="py-3 pr-4 text-foreground/90">
                      {p.version}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                          p.activo
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-700 border border-app-border",
                        ].join(" ")}
                      >
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditing(p);
                            setOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActivo(p)}
                        >
                          {p.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td className="py-6 text-sm text-app-muted" colSpan={5}>
                      No hay planes para mostrar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <PlanFormModal
          title={editing ? "Editar plan" : "Nuevo plan"}
          initial={editing}
          programas={programas}
          defaultProgramaId={selectedProgramaId}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      ) : null}
    </div>
  );
}

function PlanFormModal({
  title,
  initial,
  programas,
  defaultProgramaId,
  onClose,
  onSave,
}) {
  const [programaId, setProgramaId] = useState(
    initial?.programaId ?? defaultProgramaId ?? "",
  );
  const [codigo, setCodigo] = useState(initial?.codigo ?? "");
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [version, setVersion] = useState(initial?.version ?? "");
  const [activo, setActivo] = useState(Boolean(initial?.activo ?? true));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave({ programaId, codigo, nombre, version, activo });
    } catch (err) {
      setError(err?.message ?? "No se pudo guardar.");
      setStatus("idle");
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Programa</label>
          <select
            value={programaId}
            onChange={(e) => setProgramaId(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            required
          >
            {programas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} — {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Código</label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: ADM-2024"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Versión
            </label>
            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: 2024"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            placeholder="Ej: Plan 2024"
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-4 w-4 rounded border-app-border text-app-accent focus:ring-app-accent/30"
          />
          Activo
        </label>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

