"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-app-border bg-app-surface p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-app-muted hover:text-foreground transition-colors">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AsignaturasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");

  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/asignaturas");
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      setItems(json.items ?? []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las asignaturas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        a.nombre_asignatura.toLowerCase().includes(q) ||
        a.codigo_asignatura.toLowerCase().includes(q)
    );
  }, [items, query]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    if (data.creditos) data.creditos = Number(data.creditos);
    
    try {
      const url = editing ? `/api/asignaturas/${editing.id_asignatura}` : "/api/asignaturas";
      const method = editing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al guardar");
      }
      await loadData();
      setOpen(false);
      setEditing(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setStatus("idle");
    }
  }

  async function removeAsignatura(item) {
    try {
      const res = await fetch(`/api/asignaturas/${item.id_asignatura}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 403) {
          throw new Error("No tienes permisos suficientes para eliminar este registro.");
        }
        throw new Error(errData.message || "Esta asignatura no puede ser eliminada porque está siendo usada en un plan de estudio u otro registro vinculado.");
      }
      await loadData();
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
            Asignaturas
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Catálogo general de materias disponibles para los planes de estudio.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>Nueva Asignatura</Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="relative mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-all focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            placeholder="Buscar por nombre o código..."
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-app-muted">Cargando catálogo...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-app-muted">
                <tr className="border-b border-app-border">
                  <th className="py-3 pr-4">Código</th>
                  <th className="py-3 pr-4">Nombre</th>
                  <th className="py-3 pr-4">Tipo</th>
                  <th className="py-3 pr-4 text-center">Créditos</th>
                  <th className="py-3 pr-4 text-right">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id_asignatura} className="border-b border-app-border/60 hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4 pr-4 font-mono text-xs font-bold text-app-accent">
                      {a.codigo_asignatura}
                    </td>
                    <td className="py-4 pr-4 font-medium text-foreground">
                      {a.nombre_asignatura}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        a.tipo_asignatura === "OBLIGATORIA" 
                        ? "bg-zinc-100 border-zinc-200 text-zinc-700" 
                        : "bg-blue-50 border-blue-100 text-blue-700"
                      }`}>
                        {a.tipo_asignatura}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-center font-semibold text-foreground/80">
                      {a.creditos}
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        a.estado === "ACTIVA" ? "text-emerald-600" : "text-app-muted"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.estado === "ACTIVA" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        {a.estado}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setEditing(a); setOpen(true); }}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(a)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-app-muted">
                      No se encontraron asignaturas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal 
          title={editing ? "Editar Asignatura" : "Nueva Asignatura"} 
          onClose={() => { setOpen(false); setEditing(null); }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Código</label>
                <input 
                  name="codigo_asignatura"
                  defaultValue={editing?.codigo_asignatura}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
                  placeholder="Ej: MAT-101"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Créditos</label>
                <input 
                  name="creditos"
                  type="number"
                  defaultValue={editing?.creditos ?? 3}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Nombre de la Asignatura</label>
              <input 
                name="nombre_asignatura"
                defaultValue={editing?.nombre_asignatura}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
                placeholder="Nombre completo..."
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Tipo</label>
                <select 
                  name="tipo_asignatura"
                  defaultValue={editing?.tipo_asignatura ?? "OBLIGATORIA"}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
                >
                  <option value="OBLIGATORIA">Obligatoria</option>
                  <option value="ELECTIVA">Electiva</option>
                  <option value="OPTATIVA">Optativa</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Estado</label>
                <select 
                  name="estado"
                  defaultValue={editing?.estado ?? "ACTIVA"}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
                >
                  <option value="ACTIVA">Activa</option>
                  <option value="INACTIVA">Inactiva</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-app-border">
              <Button variant="secondary" onClick={() => { setOpen(false); setEditing(null); }} type="button">Cancelar</Button>
              <Button type="submit" disabled={status === "loading"}>
                {status === "loading" ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal 
          item={deleteTarget} 
          onClose={() => setDeleteTarget(null)} 
          onConfirm={() => removeAsignatura(deleteTarget)}
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({ item, onClose, onConfirm }) {
  return (
    <Modal title="Eliminar Asignatura" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-app-muted">
          ¿Estás seguro de que deseas eliminar la asignatura <strong className="text-foreground">{item.nombre_asignatura}</strong>? Esta acción no se puede deshacer y fallará si la asignatura ya está vinculada a un plan de estudio.
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-app-border">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white border-none">
            Sí, eliminar asignatura
          </Button>
        </div>
      </div>
    </Modal>
  );
}
