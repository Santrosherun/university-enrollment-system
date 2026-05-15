"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function Modal({ title, hint, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-app-border bg-app-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-foreground">{title}</div>
            {hint ? (
              <div className="mt-1 text-sm text-app-muted">{hint}</div>
            ) : null}
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

function ConfirmModal({ title, description, confirmLabel, onConfirm, onClose }) {
  const [status, setStatus] = useState("idle");

  async function handleConfirm() {
    setStatus("loading");
    try {
      await onConfirm();
      onClose();
    } catch {
      setStatus("idle");
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-sm leading-relaxed text-app-muted">{description}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={status === "loading"}
          onClick={handleConfirm}
        >
          {status === "loading" ? "Eliminando..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

const MODALIDADES = ["PRESENCIAL", "VIRTUAL", "HIBRIDA"];

export default function ProgramasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.codigo_programa?.toLowerCase().includes(q) ||
        p.nombre_programa?.toLowerCase().includes(q) ||
        p.modalidad_programa?.toLowerCase().includes(q),
    );
  }, [items, query]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/programas");
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.message ?? "No se pudieron cargar los programas.");
      setLoading(false);
      return;
    }
    const payload = await res.json();
    setItems(payload.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(form) {
    const isEdit = Boolean(editing?.id_programa);
    const url = isEdit ? `/api/programas/${editing.id_programa}` : "/api/programas";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo guardar el programa.");
    }

    await load();
    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(item) {
    const nuevoEstado = item.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const res = await fetch(`/api/programas/${item.id_programa}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) return;
    await load();
  }

  async function removePrograma(item) {
    const res = await fetch(`/api/programas/${item.id_programa}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo eliminar el programa.");
    }
    await load();
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Programas académicos
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Crea y administra programas (código, nombre, modalidad y estado).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo programa
        </Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">
              Buscar
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Código, nombre o modalidad..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={load}>
              Recargar
            </Button>
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
                  <th className="py-3 pr-4">Modalidad</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id_programa} className="border-b border-app-border/70">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {p.codigo_programa}
                    </td>
                    <td className="py-3 pr-4 text-foreground">{p.nombre_programa}</td>
                    <td className="py-3 pr-4 text-foreground/90">
                      {p.modalidad_programa}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                          p.estado === "ACTIVO"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-700 border border-app-border",
                        ].join(" ")}
                      >
                        {p.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
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
                          {p.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(p)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td className="py-6 text-sm text-app-muted" colSpan={5}>
                      No hay programas para mostrar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <ProgramaFormModal
          title={editing ? "Editar programa" : "Nuevo programa"}
          initial={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="Eliminar programa"
          description={
            <span>
              ¿Seguro que quieres eliminar{" "}
              <strong className="text-foreground">
                {deleteTarget.codigo_programa} — {deleteTarget.nombre_programa}
              </strong>
              ? En modo demo también se borran los{" "}
              <strong className="text-foreground">planes de estudio</strong>{" "}
              vinculados a este programa.
            </span>
          }
          confirmLabel="Sí, eliminar"
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => removePrograma(deleteTarget)}
        />
      ) : null}
    </div>
  );
}

function ProgramaFormModal({ title, initial, onClose, onSave }) {
  const [codigo_programa, setCodigo] = useState(initial?.codigo_programa ?? "");
  const [nombre_programa, setNombre] = useState(initial?.nombre_programa ?? "");
  const [modalidad_programa, setModalidad] = useState(initial?.modalidad_programa ?? "PRESENCIAL");
  const [duracion_semestres, setDuracion] = useState(initial?.duracion_semestres ?? 10);
  const [nivel_formacion, setNivel] = useState(initial?.nivel_formacion ?? "PREGRADO");
  const [estado, setEstado] = useState(initial?.estado ?? "ACTIVO");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave({
        codigo_programa,
        nombre_programa,
        modalidad_programa,
        duracion_semestres: Number(duracion_semestres),
        nivel_formacion,
        estado,
      });
    } catch (err) {
      setError(err?.message ?? "No se pudo guardar.");
      setStatus("idle");
    }
  }

  return (
    <Modal
      title={title}
      hint="Completa la información del programa."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Código</label>
            <input
              value={codigo_programa}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: ING-SIS"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Modalidad
            </label>
            <select
              value={modalidad_programa}
              onChange={(e) => setModalidad(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Nombre</label>
          <input
            value={nombre_programa}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            placeholder="Ej: Ingeniería de Sistemas"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Duración (Semestres)</label>
            <input
              type="number"
              min="1"
              max="20"
              value={duracion_semestres}
              onChange={(e) => setDuracion(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nivel de Formación</label>
            <select
              value={nivel_formacion}
              onChange={(e) => setNivel(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              <option value="PREGRADO">Pregrado</option>
              <option value="ESPECIALIZACION">Especialización</option>
              <option value="MAESTRIA">Maestría</option>
              <option value="DOCTORADO">Doctorado</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="rounded-lg border border-app-border bg-app-surface px-2 py-1 text-sm outline-none focus:border-app-accent"
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>

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
