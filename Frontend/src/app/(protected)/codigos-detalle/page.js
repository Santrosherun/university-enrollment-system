"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function Modal({ title, hint, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-app-border bg-app-surface p-6 shadow-xl animate-in fade-in zoom-in duration-200">
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

const GRUPOS = ["COBRO", "PAGO"];

export default function CodigosDetallePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterGrupo, setFilterGrupo] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = items;
    const q = query.trim().toLowerCase();
    
    if (filterGrupo) {
      list = list.filter((c) => c.grupo === filterGrupo);
    }
    
    if (q) {
      list = list.filter(
        (c) =>
          String(c.id_codigo_detalle).includes(q) ||
          c.codigo?.toLowerCase().includes(q) ||
          c.descripcion?.toLowerCase().includes(q)
      );
    }
    
    return list;
  }, [items, query, filterGrupo]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/codigos-detalle");
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? "No se pudieron cargar los códigos.");
      }
      const payload = await res.json();
      setItems(payload.items ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(form) {
    const currentId = editing?.id_codigo_detalle;
    const isEdit = Boolean(currentId);
    
    const url = isEdit ? `/api/codigos-detalle/${currentId}` : "/api/codigos-detalle";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? payload?.detail ?? "No se pudo guardar el código.");
    }

    await load();
    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(item) {
    try {
      const nuevoEstado = item.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
      const res = await fetch(`/api/codigos-detalle/${item.id_codigo_detalle}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? "Error al cambiar estado");
      }
      await load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function removeCodigo(item) {
    try {
      const res = await fetch(`/api/codigos-detalle/${item.id_codigo_detalle}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok && res.status !== 204) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? payload?.detail ?? "No se puede eliminar este código porque ya tiene movimientos asociados.");
      }
      
      await load();
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Códigos de detalle
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Administra los conceptos financieros (matrículas, seguros, carné, etc.).
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
              placeholder="Código o descripción..."
            />
          </div>
          <div className="w-full md:w-48">
            <label className="text-sm font-medium text-foreground">
              Grupo
            </label>
            <select
              value={filterGrupo}
              onChange={(e) => setFilterGrupo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              <option value="">Todos</option>
              {GRUPOS.map((g) => (
                <option key={g} value={g}>
                  {g}
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
          <div className="mt-6 text-sm text-app-muted">Cargando códigos...</div>
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
                  <th className="py-3 pr-4">Descripción</th>
                  <th className="py-3 pr-4">Grupo</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id_codigo_detalle} className="border-b border-app-border/70 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 pr-4 font-bold text-app-accent">
                      {item.codigo}
                    </td>
                    <td className="py-3 pr-4 text-foreground/90">
                      {item.descripcion}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                          item.grupo === "COBRO"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-purple-50 text-purple-700 border-purple-100",
                        ].join(" ")}
                      >
                        {item.grupo}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                          item.estado === "ACTIVO"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-700 border border-app-border",
                        ].join(" ")}
                      >
                        {item.estado === "ACTIVO" ? "Activo" : "Inactivo"}
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
                          {item.estado === "ACTIVO" ? "Desactivar" : "Activar"}
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
                    <td className="py-6 text-sm text-app-muted" colSpan={6}>
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
                {deleteTarget.codigo}
              </strong>? Esta acción no se puede deshacer y fallará si ya existen transacciones vinculadas.
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
  const [formData, setFormData] = useState({
    codigo: initial?.codigo ?? "",
    descripcion: initial?.descripcion ?? "",
    grupo: initial?.grupo ?? "COBRO",
    estado: initial?.estado ?? "ACTIVO",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err?.message ?? "No se pudo guardar.");
      setStatus("idle");
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      title={title}
      hint="Define el código y su naturaleza financiera."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Código</label>
            <input
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: PMAT"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Grupo</label>
            <select
              name="grupo"
              value={formData.grupo}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              {GRUPOS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Descripción</label>
          <input
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            placeholder="Ej: Valor Global de Matrícula..."
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent"
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
