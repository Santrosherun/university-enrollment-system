"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function Modal({ title, hint, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl rounded-2xl border border-app-border bg-app-surface p-6 shadow-2xl animate-fadeIn">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-bold text-foreground">{title}</div>
            {hint ? (
              <div className="mt-1 text-xs text-app-muted">{hint}</div>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default function PeriodosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (p) =>
        p.codigo_periodo?.toLowerCase().includes(q) ||
        String(p.anio).includes(q) ||
        p.estado?.toLowerCase().includes(q)
    );
  }, [items, query]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/periodos");
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? "No se pudieron cargar los periodos académicos.");
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
    const isEdit = Boolean(editing?.id_periodo || editing?.codigo_periodo);
    const idParam = editing?.id_periodo || editing?.codigo_periodo;
    const url = isEdit ? `/api/periodos/${idParam}` : "/api/periodos";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo guardar la configuración del periodo.");
    }

    await load();
    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(item) {
    const idParam = item.id_periodo || item.codigo_periodo;
    const nuevoEstado = item.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const res = await fetch(`/api/periodos/${idParam}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) return;
    await load();
  }

  return (
    <div className="space-y-7 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Periodos Académicos
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Configura los intervalos de matrícula, fechas de vigencia e identificadores temporales.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          ➕ Nuevo Periodo
        </Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-md">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">
              Filtrar Periodos
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Buscar por código (ej. 2025-1), año o estado..."
            />
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button variant="secondary" size="sm" onClick={load}>
              🔄 Recargar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 text-center py-6 text-xs text-app-muted animate-pulse">Consultando historial de periodos...</div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 font-medium">
            ⚠️ {error}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-app-muted bg-zinc-50 dark:bg-zinc-900/50">
                <tr className="border-b border-app-border">
                  <th className="p-3 rounded-l-lg">Código</th>
                  <th className="p-3 text-center">Año</th>
                  <th className="p-3 text-center">Semestre / Ciclo</th>
                  <th className="p-3">Inicio</th>
                  <th className="p-3">Fin</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right rounded-r-lg">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/60">
                {filtered.map((p) => (
                  <tr key={p.id_periodo || p.codigo_periodo} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="p-3 font-bold text-foreground">
                      {p.codigo_periodo}
                    </td>
                    <td className="p-3 text-center font-semibold text-app-muted">
                      {p.anio}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-bold text-foreground/80">
                        #{p.numero_periodo}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-app-muted font-medium">
                      {p.fecha_inicio}
                    </td>
                    <td className="p-3 text-xs text-app-muted font-medium">
                      {p.fecha_fin}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          p.estado === "ACTIVO"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-600 border border-app-border dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {p.estado || "ACTIVO"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-1 justify-end">
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
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="py-10 text-center text-xs text-app-muted" colSpan={7}>
                      No se encontraron periodos académicos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <PeriodoFormModal
          title={editing ? "Editar Periodo Académico" : "Nuevo Periodo Académico"}
          initial={editing}
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

function PeriodoFormModal({ title, initial, onClose, onSave }) {
  const isEdit = Boolean(initial);
  const currentYear = new Date().getFullYear();
  const [anio, setAnio] = useState(initial?.anio ?? currentYear);
  const [numero_periodo, setNumeroPeriodo] = useState(initial?.numero_periodo ?? 1);
  const [codigo_periodo, setCodigoPeriodo] = useState(initial?.codigo_periodo ?? `${currentYear}-1`);
  const [fecha_inicio, setFechaInicio] = useState(initial?.fecha_inicio ?? `${currentYear}-01-15`);
  const [fecha_fin, setFechaFin] = useState(initial?.fecha_fin ?? `${currentYear}-06-30`);
  const [estado, setEstado] = useState(initial?.estado ?? "ACTIVO");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  function handleAnioChange(val) {
    setAnio(val);
    if (!isEdit) setCodigoPeriodo(`${val}-${numero_periodo}`);
  }

  function handleNumChange(val) {
    setNumeroPeriodo(val);
    if (!isEdit) setCodigoPeriodo(`${anio}-${val}`);
  }

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave({
        codigo_periodo,
        numero_periodo: Number(numero_periodo),
        anio: Number(anio),
        fecha_inicio,
        fecha_fin,
        estado
      });
    } catch (err) {
      setError(err?.message ?? "Error inesperado al guardar the period.");
      setStatus("idle");
    }
  }

  return (
    <Modal
      title={title}
      hint="Define the code, dates and cycle."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Año Lectivo</label>
            <select
              value={anio}
              onChange={(e) => handleAnioChange(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 font-bold cursor-pointer"
              required
            >
              {Array.from({ length: 16 }, (_, i) => 2020 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Número Semestre / Ciclo</label>
            <select
              value={numero_periodo}
              onChange={(e) => handleNumChange(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 font-bold cursor-pointer"
            >
              <option value={1}>1 (Primer Semestre)</option>
              <option value={2}>2 (Intersemestral / Verano)</option>
              <option value={3}>3 (Segundo Semestre)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Código del Periodo (Automático)</label>
          <div className="w-full rounded-xl border border-dashed border-app-border bg-zinc-50/50 px-3 py-2.5 text-sm font-mono font-bold text-app-accent flex justify-between items-center">
            <span>{codigo_periodo}</span>
            <span className="text-[10px] font-black uppercase text-app-muted/50 tracking-tighter">ID Sistema</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Fecha de Inicio</label>
            <input
              type="date"
              value={fecha_inicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-app-accent cursor-pointer"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Fecha de Finalización</label>
            <input
              type="date"
              value={fecha_fin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-app-accent cursor-pointer"
              required
            />
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Estado Inicial</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent cursor-pointer"
          >
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 font-medium">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-3 border-t border-app-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Guardando..." : "Guardar Periodo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
