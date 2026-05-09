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

const TIPOS = ["COBRO", "PAGO"];

export default function CodigosDetallePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = items;
    const q = query.trim().toLowerCase();
    
    if (filterTipo) {
      list = list.filter((c) => c.tipo === filterTipo);
    }
    
    if (q) {
      list = list.filter(
        (c) =>
          c.codigo?.toLowerCase().includes(q) ||
          c.nombre?.toLowerCase().includes(q)
      );
    }
    
    return list;
  }, [items, query, filterTipo]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/codigos-detalle");
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.message ?? "No se pudieron cargar los códigos de detalle.");
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
    const isEdit = Boolean(editing?.id);
    const url = isEdit ? `/api/codigos-detalle/${editing.id}` : "/api/codigos-detalle";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo guardar el código.");
    }

    await load();
    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(item) {
    const res = await fetch(`/api/codigos-detalle/${item.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ activo: !item.activo }),
    });
    if (!res.ok) return;
    await load();
  }

  async function removeCodigo(item) {
    const res = await fetch(`/api/codigos-detalle/${item.id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo eliminar el código.");
    }
    await load();
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Códigos de detalle
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Administra los conceptos de cobro y pago (matrículas, seguros, becas, etc.).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo código
        </Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">
              Buscar
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Código o nombre..."
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium text-foreground">
              Tipo
            </label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              <option value="">Todos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end self-end">
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
                  <th className="py-3 pr-4">Tipo</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-app-border/70">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {item.codigo}
                    </td>
                    <td className="py-3 pr-4 text-foreground">{item.nombre}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          item.tipo === "COBRO"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-purple-50 text-purple-700 border border-purple-100",
                        ].join(" ")}
                      >
                        {item.tipo}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                          item.activo
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-700 border border-app-border",
                        ].join(" ")}
                      >
                        {item.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setEditing(item);
                            setOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActivo(item)}
                        >
                          {item.activo ? "Desactivar" : "Activar"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(item)}
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
                      No hay códigos para mostrar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <CodigoFormModal
          title={editing ? "Editar código de detalle" : "Nuevo código de detalle"}
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
          title="Eliminar código"
          description={
            <span>
              ¿Seguro que quieres eliminar el código{" "}
              <strong className="text-foreground">
                {deleteTarget.codigo} — {deleteTarget.nombre}
              </strong>
              ? Esta acción no se puede deshacer.
            </span>
          }
          confirmLabel="Sí, eliminar"
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => removeCodigo(deleteTarget)}
        />
      ) : null}
    </div>
  );
}

function CodigoFormModal({ title, initial, onClose, onSave }) {
  const [codigo, setCodigo] = useState(initial?.codigo ?? "");
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [tipo, setTipo] = useState(initial?.tipo ?? "COBRO");
  const [activo, setActivo] = useState(Boolean(initial?.activo ?? true));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave({ codigo, nombre, tipo, activo });
    } catch (err) {
      setError(err?.message ?? "No se pudo guardar.");
      setStatus("idle");
    }
  }

  return (
    <Modal
      title={title}
      hint="Define el código y su naturaleza (Cobro o Pago)."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Código</label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: MAT-PRE"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Tipo
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            placeholder="Ej: Matrícula Pregrado"
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


