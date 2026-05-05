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

const formatCurrency = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);
};

export default function CobrosPage() {
  const [items, setItems] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPeriodo, setFilterPeriodo] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const [showIndividual, setShowIndividual] = useState(false);
  const [showMasivo, setShowMasivo] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewingCobro, setViewingCobro] = useState(null);

  const filtered = useMemo(() => {
    let list = items;
    if (filterPeriodo) {
      list = list.filter((c) => c.periodo.includes(filterPeriodo));
    }
    if (filterEstado) {
      list = list.filter((c) => c.estado === filterEstado);
    }
    return list;
  }, [items, filterPeriodo, filterEstado]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [resCobros, resEst, resProg, resCodes] = await Promise.all([
        fetch("/api/cobros"),
        fetch("/api/estudiantes"),
        fetch("/api/programas"),
        fetch("/api/codigos-detalle"),
      ]);

      if (!resCobros.ok || !resEst.ok || !resProg.ok || !resCodes.ok) {
        throw new Error("Error al cargar datos del sistema.");
      }

      const [dataCobros, dataEst, dataProg, dataCodes] = await Promise.all([
        resCobros.json(),
        resEst.json(),
        resProg.json(),
        resCodes.json(),
      ]);

      setItems(dataCobros.items ?? []);
      setEstudiantes(dataEst.items ?? []);
      setProgramas(dataProg.items ?? []);
      // No necesitamos guardar codigos-detalle en el estado global si solo se usan en el modal,
      // pero los pasaremos al modal de detalle.
      window.__codigosDetalle = dataCodes.items ?? []; 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function removeCobro(id) {
    const res = await fetch(`/api/cobros/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo eliminar el cobro.");
    }
    await loadData();
    setDeleteTarget(null);
  }

  const getEstName = (id) => estudiantes.find((e) => e.id === id)?.nombreCompleto ?? id;
  const getEstDoc = (id) => estudiantes.find((e) => e.id === id)?.numeroDocumento ?? "";

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Generación de cobros
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Genera deudas de matrícula de forma individual o masiva para un periodo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowMasivo(true)}>
            Generación Masiva
          </Button>
          <Button onClick={() => setShowIndividual(true)}>
            Nuevo Cobro Individual
          </Button>
        </div>
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
            <label className="text-sm font-medium text-foreground">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADO">Pagado</option>
              <option value="ANULADO">Anulado</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={loadData}>
              Recargar lista
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-app-muted">Cargando cobros...</div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-app-muted">
                <tr className="border-b border-app-border">
                  <th className="py-3 pr-4">Estudiante</th>
                  <th className="py-3 pr-4">Periodo</th>
                  <th className="py-3 pr-4">Valor Total</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-app-border/70 hover:bg-zinc-50/50">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-foreground">{getEstName(item.estudianteId)}</div>
                      <div className="text-xs text-app-muted">{getEstDoc(item.estudianteId)}</div>
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {item.periodo}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-app-accent">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          item.estado === "PENDIENTE" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          item.estado === "PAGADO" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        ].join(" ")}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingCobro(item)}
                        >
                          Ver Detalle
                        </Button>
                        {item.estado === "PENDIENTE" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td className="py-6 text-sm text-app-muted" colSpan={5}>
                      No se han encontrado cobros generados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showIndividual && (
        <GeneracionIndividualModal
          estudiantes={estudiantes}
          onClose={() => setShowIndividual(false)}
          onSuccess={loadData}
        />
      )}

      {showMasivo && (
        <GeneracionMasivaModal
          programas={programas}
          onClose={() => setShowMasivo(false)}
          onSuccess={loadData}
        />
      )}

      {viewingCobro && (
        <DetalleCobroModal
          cobro={viewingCobro}
          estudiante={estudiantes.find(e => e.id === viewingCobro.estudianteId)}
          codigosDetalle={window.__codigosDetalle || []}
          onClose={() => setViewingCobro(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar cobro"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="text-sm text-app-muted">
            ¿Estás seguro de que deseas eliminar este cobro de <strong className="text-foreground">{getEstName(deleteTarget.estudianteId)}</strong>?
            Esta acción no se puede deshacer.
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => removeCobro(deleteTarget.id)}>Eliminar definitivamente</Button>
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}

function ConfirmModal({ title, children, onClose }) {
  return (
    <Modal title={title} onClose={onClose}>
      {children}
    </Modal>
  );
}

function GeneracionIndividualModal({ estudiantes, onClose, onSuccess }) {
  const [estudianteId, setEstudianteId] = useState("");
  const [periodo, setPeriodo] = useState("2024-1");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/cobros", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ estudianteId, periodo }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? "Error al generar cobro.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  return (
    <Modal title="Generación Individual" hint="Selecciona un estudiante para crear su cobro." onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Estudiante</label>
          <select
            value={estudianteId}
            onChange={(e) => setEstudianteId(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            required
          >
            <option value="">Selecciona un estudiante...</option>
            {estudiantes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.numeroDocumento} - {e.nombreCompleto}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Periodo Académico</label>
          <input
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            placeholder="Ej: 2024-1"
            required
          />
        </div>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg">{error}</div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Generando..." : "Generar Cobro"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function GeneracionMasivaModal({ programas, onClose, onSuccess }) {
  const [programaId, setProgramaId] = useState("");
  const [periodo, setPeriodo] = useState("2024-1");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/cobros/generate-mass", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ programaId, periodo }),
      });
      const data = await res.json();
      setResult(data);
      onSuccess();
    } catch (err) {
      setStatus("idle");
    }
  }

  return (
    <Modal title="Generación Masiva" hint="Crea cobros para todos los estudiantes de un programa." onClose={onClose}>
      {!result ? (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Programa Académico</label>
            <select
              value={programaId}
              onChange={(e) => setProgramaId(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              <option value="">Todos los programas...</option>
              {programas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Periodo Académico</label>
            <input
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: 2024-1"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Procesando..." : "Iniciar Generación Masiva"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
            <div className="text-emerald-800 font-semibold">Proceso finalizado</div>
            <div className="text-sm text-emerald-700">Se generaron satisfactoriamente <strong>{result.count}</strong> cobros.</div>
          </div>
          {result.errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              <div className="text-xs font-semibold text-app-muted uppercase">Errores encontrados ({result.errors.length}):</div>
              {result.errors.map((err, i) => (
                <div key={i} className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                  <strong>{err.estudiante}</strong>: {err.error}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={onClose}>Finalizar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetalleCobroModal({ cobro, estudiante, codigosDetalle, onClose }) {
  const getCodeName = (id) => codigosDetalle.find(c => c.id === id)?.nombre ?? "Concepto desconocido";

  return (
    <Modal title="Detalle del Cobro" hint={`ID: ${cobro.id}`} onClose={onClose}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 border border-app-border">
          <div>
            <div className="text-[10px] uppercase font-bold text-app-muted tracking-wider">Estudiante</div>
            <div className="text-sm font-semibold text-foreground">{estudiante?.nombreCompleto}</div>
            <div className="text-xs text-app-muted">{estudiante?.numeroDocumento}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-app-muted tracking-wider">Periodo</div>
            <div className="text-sm font-semibold text-foreground">{cobro.periodo}</div>
            <div className="text-xs text-app-muted">Estado: {cobro.estado}</div>
          </div>
        </div>

        <div>
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase font-bold text-app-muted border-b border-app-border">
              <tr>
                <th className="pb-2">Concepto</th>
                <th className="pb-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border/50">
              {cobro.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-foreground/80">{getCodeName(item.codigoDetalleId)}</td>
                  <td className="py-3 text-right font-medium text-foreground">{formatCurrency(item.valor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-app-border font-bold text-foreground">
                <td className="pt-4">TOTAL A PAGAR</td>
                <td className="pt-4 text-right text-app-accent">{formatCurrency(cobro.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>Cerrar Detalle</Button>
        </div>
      </div>
    </Modal>
  );
}



