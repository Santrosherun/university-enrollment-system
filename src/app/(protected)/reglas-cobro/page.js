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

const formatCurrency = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);
};

export default function ReglasCobroPage() {
  const [items, setItems] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [codigosDetalle, setCodigosDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPeriodo, setFilterPeriodo] = useState("");
  const [filterPrograma, setFilterPrograma] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = items;
    if (filterPeriodo) {
      list = list.filter((r) => r.periodo.includes(filterPeriodo));
    }
    if (filterPrograma) {
      list = list.filter((r) => r.programaId === filterPrograma);
    }
    return list;
  }, [items, filterPeriodo, filterPrograma]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [resRules, resProgs, resCodes] = await Promise.all([
        fetch("/api/reglas-cobro"),
        fetch("/api/programas"),
        fetch("/api/codigos-detalle"),
      ]);

      if (!resRules.ok || !resProgs.ok || !resCodes.ok) {
        throw new Error("Error al cargar los datos del sistema.");
      }

      const [dataRules, dataProgs, dataCodes] = await Promise.all([
        resRules.json(),
        resProgs.json(),
        resCodes.json(),
      ]);

      setItems(dataRules.items ?? []);
      setProgramas(dataProgs.items ?? []);
      setCodigosDetalle(dataCodes.items ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function save(form) {
    const isEdit = Boolean(editing?.id);
    const url = isEdit ? `/api/reglas-cobro/${editing.id}` : "/api/reglas-cobro";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo guardar la regla.");
    }

    await loadData();
    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(item) {
    const res = await fetch(`/api/reglas-cobro/${item.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ activo: !item.activo }),
    });
    if (!res.ok) return;
    await loadData();
  }

  async function removeRegla(item) {
    const res = await fetch(`/api/reglas-cobro/${item.id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo eliminar la regla.");
    }
    await loadData();
  }

  const getProgName = (id) => programas.find((p) => p.id === id)?.nombre ?? id;
  const getCodeName = (id) => codigosDetalle.find((c) => c.id === id)?.nombre ?? id;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Reglas de cobro
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Define los valores económicos por periodo, programa y concepto.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva regla
        </Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-foreground">Periodo</label>
            <input
              value={filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: 2024-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Programa</label>
            <select
              value={filterPrograma}
              onChange={(e) => setFilterPrograma(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              <option value="">Todos los programas</option>
              {programas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={loadData}>
              Recargar datos
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-app-muted">Cargando reglas...</div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-app-muted">
                <tr className="border-b border-app-border">
                  <th className="py-3 pr-4">Periodo</th>
                  <th className="py-3 pr-4">Programa</th>
                  <th className="py-3 pr-4">Concepto</th>
                  <th className="py-3 pr-4">Valor</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-app-border/70 hover:bg-zinc-50/50">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {item.periodo}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {getProgName(item.programaId)}
                    </td>
                    <td className="py-3 pr-4 text-app-muted">
                      {getCodeName(item.codigoDetalleId)}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-app-accent">
                      {formatCurrency(item.valor)}
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
                        {item.activo ? "Activa" : "Inactiva"}
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
                    <td className="py-6 text-sm text-app-muted" colSpan={6}>
                      No hay reglas de cobro configuradas.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <ReglaFormModal
          title={editing ? "Editar regla de cobro" : "Nueva regla de cobro"}
          initial={editing}
          programas={programas}
          codigosDetalle={codigosDetalle}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="Eliminar regla"
          description={
            <span>
              ¿Seguro que quieres eliminar esta regla de cobro? Los cobros ya generados con esta regla no se verán afectados, pero no se podrán generar nuevos cobros con ella.
            </span>
          }
          confirmLabel="Sí, eliminar"
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => removeRegla(deleteTarget)}
        />
      ) : null}
    </div>
  );
}

function ReglaFormModal({ title, initial, programas, codigosDetalle, onClose, onSave }) {
  const [periodo, setPeriodo] = useState(initial?.periodo ?? "");
  const [programaId, setProgramaId] = useState(initial?.programaId ?? "");
  const [codigoDetalleId, setCodigoDetalleId] = useState(initial?.codigoDetalleId ?? "");
  const [valor, setValor] = useState(initial?.valor ?? "");
  const [activo, setActivo] = useState(Boolean(initial?.activo ?? true));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave({
        periodo,
        programaId,
        codigoDetalleId,
        valor: Number(valor),
        activo,
      });
    } catch (err) {
      setError(err?.message ?? "No se pudo guardar.");
      setStatus("idle");
    }
  }

  return (
    <Modal
      title={title}
      hint="Configura los parámetros de la regla."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Periodo</label>
            <input
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: 2024-1"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Valor (COP)</label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: 4500000"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Programa Académico</label>
          <select
            value={programaId}
            onChange={(e) => setProgramaId(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            required
          >
            <option value="">Selecciona un programa...</option>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.modalidad})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Concepto de Detalle</label>
          <select
            value={codigoDetalleId}
            onChange={(e) => setCodigoDetalleId(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            required
          >
            <option value="">Selecciona un concepto...</option>
            {codigosDetalle.filter(c => c.tipo === 'COBRO').map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} — {c.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs text-app-muted mt-1">Solo se muestran conceptos de tipo COBRO.</p>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-4 w-4 rounded border-app-border text-app-accent focus:ring-app-accent/30"
          />
          Activa
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


