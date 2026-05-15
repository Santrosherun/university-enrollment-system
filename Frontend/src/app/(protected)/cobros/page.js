"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  const [periodos, setPeriodos] = useState([]);
  const [codigosDetalle, setCodigosDetalle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPeriodo, setFilterPeriodo] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showIndividual, setShowIndividual] = useState(false);
  const [showMasivo, setShowMasivo] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewingCobro, setViewingCobro] = useState(null);

  const filtered = useMemo(() => {
    let list = items;
    if (filterPeriodo) {
      list = list.filter((c) => String(c.id_periodo) === String(filterPeriodo));
    }
    if (filterEstado) {
      list = list.filter((c) => c.estado === filterEstado);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => 
        c.numero_volante?.toLowerCase().includes(q) ||
        c.estudiante_nombre?.toLowerCase().includes(q) ||
        String(c.id_estudiante).includes(q)
      );
    }
    return list;
  }, [items, filterPeriodo, filterEstado, searchQuery]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [resCobros, resEst, resProg, resPeriods, resCodes] = await Promise.all([
        fetch("/api/cobros"),
        fetch("/api/estudiantes"),
        fetch("/api/programas"),
        fetch("/api/periodos"),
        fetch("/api/codigos-detalle"),
      ]);

      if (!resCobros.ok || !resEst.ok || !resProg.ok || !resPeriods.ok || !resCodes.ok) {
        throw new Error("Error al cargar datos del sistema.");
      }

      const checkJson = async (res) => {
        const ct = res.headers.get("content-type");
        if (!ct || !ct.includes("application/json")) {
           const t = await res.text();
           console.error(`Route ${res.url} returned non-JSON:`, t.substring(0, 100));
           throw new Error(`La ruta ${new URL(res.url).pathname} no devolvió JSON.`);
        }
        return res.json();
      };

      const [dataCobros, dataEst, dataProg, dataPeriods, dataCodes] = await Promise.all([
        checkJson(resCobros),
        checkJson(resEst),
        checkJson(resProg),
        checkJson(resPeriods),
        checkJson(resCodes),
      ]);

      setItems(dataCobros.items ?? []);
      setEstudiantes(dataEst.items ?? []);
      setProgramas(dataProg.items ?? []);
      setPeriodos(dataPeriods.items ?? []);
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

  async function removeCobro(id) {
    try {
      const res = await fetch(`/api/cobros/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? "No se pudo eliminar el cobro.");
      }
      await loadData();
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    }
  }

  const getPeriodoCode = (id) => periodos.find(p => String(p.id_periodo) === String(id))?.codigo_periodo ?? id;

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
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Buscar Volante</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="N° Volante, estudiante o ID..."
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/60 outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Periodo</label>
            <select
              value={filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 cursor-pointer"
            >
              <option value="">Todos los periodos</option>
              {periodos.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>{p.codigo_periodo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Estado</label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="GENERADO">Generado</option>
              <option value="PARCIAL">Pago Parcial</option>
              <option value="PAGADO">Pagado</option>
              <option value="ANULADO">Anulado</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={loadData} className="w-full justify-center">
              🔄 Recargar
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
                  <th className="py-3 pr-4">Número Volante</th>
                  <th className="py-3 pr-4">Estudiante</th>
                  <th className="py-3 pr-4">Periodo</th>
                  <th className="py-3 pr-4">Valor Total</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id_volante} className="border-b border-app-border/70 hover:bg-zinc-50/50">
                    <td className="py-3 pr-4 font-mono text-xs text-foreground">
                      {item.numero_volante}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-foreground">{item.estudiante_nombre}</div>
                      <div className="text-xs text-app-muted">ID: {item.id_estudiante}</div>
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {getPeriodoCode(item.id_periodo)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-app-accent">{formatCurrency(item.total)}</div>
                      {item.saldo_pendiente < item.total && item.saldo_pendiente > 0 && (
                        <div className="text-[10px] font-bold text-amber-600">Restan: {formatCurrency(item.saldo_pendiente)}</div>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          item.estado === "GENERADO" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          item.estado === "PARCIAL" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                          item.estado === "PAGADO" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        ].join(" ")}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <a 
                          href={`/api/cobros/${item.id_volante}/pdf`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Button variant="secondary" size="sm">
                            Imprimir Volante
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingCobro(item)}
                        >
                          Ver Detalle
                        </Button>

                        {item.estado === "GENERADO" && (
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
                    <td className="py-6 text-sm text-app-muted" colSpan={6}>
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
          periodos={periodos}
          codigosDetalle={codigosDetalle}
          onClose={() => setShowIndividual(false)}
          onSuccess={loadData}
        />
      )}

      {showMasivo && (
        <GeneracionMasivaModal
          programas={programas}
          periodos={periodos}
          onClose={() => setShowMasivo(false)}
          onSuccess={loadData}
        />
      )}

      {viewingCobro && (
        <DetalleCobroModal
          cobro={viewingCobro}
          estudiante={estudiantes.find(e => e.id_estudiante === viewingCobro.id_estudiante)}
          codigosDetalle={codigosDetalle}
          onClose={() => setViewingCobro(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar cobro"
          onClose={() => setDeleteTarget(null)}
        >
          <div className="text-sm text-app-muted">
            ¿Estás seguro de que deseas eliminar el volante <strong className="text-foreground">{deleteTarget.numero_volante}</strong> de <strong className="text-foreground">{deleteTarget.estudiante_nombre}</strong>?
            Esta acción no se puede deshacer.
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => removeCobro(deleteTarget.id_volante)}>Eliminar definitivamente</Button>
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

function GeneracionIndividualModal({ estudiantes, periodos, codigosDetalle, onClose, onSuccess }) {
  const [id_estudiante, setEstId] = useState("");
  const [id_periodo, setPeriodo] = useState("");
  const [tipo, setTipo] = useState("MATRICULA");
  const [id_codigo_detalle, setCodigoId] = useState("");
  const [valor, setValor] = useState("");
  const [modalidad_cobro, setModalidad] = useState("GLOBAL");
  const [semestre, setSemestre] = useState("1");
  
  const [asignaturasPlan, setAsignaturasPlan] = useState([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState([]);
  const [reglasCobro, setReglasCobro] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // 1. Cargar las reglas de cobro disponibles para previsualizar precios
  useEffect(() => {
    fetch("/api/reglas-cobro")
      .then(r => r.json())
      .then(d => setReglasCobro(d.items || []))
      .catch(console.error);
  }, []);

  // 2. Cargar las materias del plan de estudios cuando se elige estudiante, créditos y semestre
  useEffect(() => {
    if (!id_estudiante || modalidad_cobro !== "CREDITOS" || tipo !== "MATRICULA") {
      setAsignaturasPlan([]);
      return;
    }
    const est = estudiantes.find(e => String(e.id_estudiante) === String(id_estudiante));
    if (!est) return;
    
    setLoadingPlanes(true);
    fetch(`/api/planes?id_programa=${est.id_programa}`)
      .then(r => r.json())
      .then(d => {
         // Filtramos las asignaturas correspondientes al semestre elegido
         const asigs = (d.items || []).filter(a => String(a.semestre) === String(semestre));
         setAsignaturasPlan(asigs);
         // Por defecto seleccionamos todas las del semestre
         setAsignaturasSeleccionadas(asigs.map(a => a.id_asignatura));
      })
      .catch(console.error)
      .finally(() => setLoadingPlanes(false));
  }, [id_estudiante, modalidad_cobro, semestre, estudiantes, tipo]);

  // Manejar selección individual de materias
  function toggleAsignatura(id) {
    setAsignaturasSeleccionadas(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  // Calcular total de créditos seleccionados
  const totalCreditos = useMemo(() => {
    return asignaturasSeleccionadas.reduce((acc, id) => {
      const found = asignaturasPlan.find(a => a.id_asignatura === id);
      return acc + (found ? Number(found.creditos || 0) : 0);
    }, 0);
  }, [asignaturasSeleccionadas, asignaturasPlan]);

  // Buscar la regla de cobro aplicable para proyectar el subtotal
  const reglaAplicable = useMemo(() => {
    if (!id_estudiante || !id_periodo) return null;
    const est = estudiantes.find(e => String(e.id_estudiante) === String(id_estudiante));
    if (!est) return null;
    return reglasCobro.find(r => 
      String(r.id_programa) === String(est.id_programa) &&
      String(r.id_periodo) === String(id_periodo) &&
      r.modalidad_cobro === (modalidad_cobro === "CREDITOS" ? "CREDITOS" : "GLOBAL") &&
      r.estado === "ACTIVA"
    );
  }, [id_estudiante, id_periodo, modalidad_cobro, estudiantes, reglasCobro]);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      if (tipo === "MATRICULA" && modalidad_cobro === "CREDITOS" && totalCreditos === 0) {
        throw new Error("Debes seleccionar al menos una materia para liquidar el cobro por créditos.");
      }

      const payload = { 
        id_estudiante: Number(id_estudiante) || id_estudiante, 
        id_periodo: Number(id_periodo) || id_periodo, 
        modalidad_cobro: tipo === "MATRICULA" ? modalidad_cobro : "OTRO",
        id_codigo_detalle: tipo === "OTRO" ? (Number(id_codigo_detalle) || id_codigo_detalle) : undefined,
        valor: tipo === "OTRO" ? Number(valor) : (modalidad_cobro === "CREDITOS" && reglaAplicable ? totalCreditos * Number(reglaAplicable.valor_credito || 0) : undefined),
        creditos: tipo === "MATRICULA" && modalidad_cobro === "CREDITOS" ? totalCreditos : undefined,
        asignaturas: tipo === "MATRICULA" && modalidad_cobro === "CREDITOS" ? asignaturasSeleccionadas : undefined,
        semestre_a_cursar: Number(semestre)
      };

      const res = await fetch("/api/cobros", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? data?.detail?.[0]?.msg ?? "Error al liquidar y generar el volante individual.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  return (
    <Modal title="Generación Individual de Cobro" hint="Liquida volantes personalizando conceptos y carga de créditos." onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 animate-fadeIn">
        <div className="space-y-1">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Estudiante a Liquidar</label>
          <select
            value={id_estudiante}
            onChange={(e) => setEstId(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 font-semibold"
            required
          >
            <option value="">Selecciona un estudiante de la lista...</option>
            {estudiantes.map((e) => (
              <option key={e.id_estudiante} value={e.id_estudiante}>
                {e.numero_documento} — {e.primer_nombre} {e.primer_apellido}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Naturaleza del Cobro</label>
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer font-medium">
              <input type="radio" checked={tipo === "MATRICULA"} onChange={() => setTipo("MATRICULA")} className="accent-app-accent" />
              Matrícula Académica
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer font-medium">
              <input type="radio" checked={tipo === "OTRO"} onChange={() => setTipo("OTRO")} className="accent-app-accent" />
              Otro Servicio / Derechos
            </label>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Periodo Académico</label>
            <select
              value={id_periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 cursor-pointer"
              required
            >
              <option value="">Selecciona periodo...</option>
              {periodos.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>{p.codigo_periodo}</option>
              ))}
            </select>
          </div>
          {tipo === "MATRICULA" ? (
            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Modalidad de Liquidación</label>
              <select
                value={modalidad_cobro}
                onChange={(e) => setModalidad(e.target.value)}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 cursor-pointer font-bold text-app-accent"
                required
              >
                <option value="GLOBAL">Cobro Global (Tarifa Plena)</option>
                <option value="CREDITOS">Por Créditos (Selección de Materias)</option>
              </select>
            </div>
          ) : (
             <div className="space-y-1">
               <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Concepto Específico</label>
               <select
                 value={id_codigo_detalle}
                 onChange={(e) => setCodigoId(e.target.value)}
                 className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 cursor-pointer"
                 required
               >
                 <option value="">Selecciona concepto...</option>
                 {codigosDetalle.filter(c => c.grupo === "COBRO" || c.tipo_codigo === "COBRO").map(c => (
                    <option key={c.id_codigo_detalle} value={c.id_codigo_detalle}>{c.codigo || c.nombre_codigo} — {c.descripcion || c.nombre_codigo}</option>
                 ))}
               </select>
             </div>
          )}
        </div>

        {tipo === "OTRO" && (
           <div className="space-y-1">
             <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Valor a Cobrar (COP)</label>
             <input
               type="number"
               value={valor}
               onChange={(e) => setValor(e.target.value)}
               className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 font-bold"
               placeholder="Ej: 150000"
               required
             />
           </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Semestre de Referencia</label>
          <select
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 cursor-pointer"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semestre {s}</option>)}
          </select>
        </div>

        {/* INTERFAZ DINÁMICA DE SELECCIÓN DE MATERIAS Y CÁLCULO POR CRÉDITOS */}
        {tipo === "MATRICULA" && modalidad_cobro === "CREDITOS" && (
          <div className="mt-4 p-4 rounded-xl border-2 border-app-accent/20 bg-app-surface/50 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-app-border/60">
              <span className="text-xs font-bold text-foreground">Selección de Carga Académica</span>
              {loadingPlanes ? (
                <span className="text-[10px] text-app-muted animate-pulse">Cargando asignaturas...</span>
              ) : (
                <span className="text-[10px] bg-app-accent/10 text-app-accent px-2 py-0.5 rounded font-black tracking-wide">
                  {totalCreditos} Créditos Seleccionados
                </span>
              )}
            </div>

            {asignaturasPlan.length === 0 && !loadingPlanes ? (
              <div className="py-4 text-center text-xs text-app-muted italic">
                No se encontraron asignaturas en el plan de estudios para el Semestre {semestre} de este programa.
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 divide-y divide-app-border/40">
                {asignaturasPlan.map((asig) => {
                  const isChecked = asignaturasSeleccionadas.includes(asig.id_asignatura);
                  return (
                    <label 
                      key={asig.id_asignatura} 
                      className="flex items-start gap-3 pt-2 cursor-pointer group select-none"
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleAsignatura(asig.id_asignatura)}
                        className="mt-1 rounded accent-app-accent cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold transition-colors ${isChecked ? "text-foreground" : "text-app-muted line-through"}`}>
                          {asig.nombre_asignatura}
                        </div>
                        <div className="text-[10px] text-app-muted">
                          Código: {asig.codigo_asignatura} — <strong className="text-foreground/80">{asig.creditos} créditos</strong>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* PREVISUALIZACIÓN DE TARIFA Y SUBTOTAL LIQUIDADO */}
            <div className="pt-2 border-t border-app-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs bg-app-surface p-2 rounded-lg">
              <div>
                <span className="text-app-muted">Valor por Crédito:</span>{" "}
                <strong className="text-foreground">
                  {reglaAplicable ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(reglaAplicable.valor_credito || 0) : "Sin regla activa"}
                </strong>
              </div>
              <div>
                <span className="text-app-muted">Liquidación Proyectada:</span>{" "}
                <strong className="text-base font-black text-app-accent">
                  {reglaAplicable ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(totalCreditos * Number(reglaAplicable.valor_credito || 0)) : "$0"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg font-medium animate-shake">
            ⚠️ {error}
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-3 border-t border-app-border">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Procesando Liquidación..." : "Generar Volante Definitivo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function GeneracionMasivaModal({ programas, periodos, onClose, onSuccess }) {
  const [id_programa, setProgId] = useState("");
  const [id_periodo, setPeriodo] = useState("");
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
        body: JSON.stringify({ id_programa: id_programa ? Number(id_programa) : null, id_periodo: Number(id_periodo) }),
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
              value={id_programa}
              onChange={(e) => setProgId(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              <option value="">Todos los programas...</option>
              {programas.map((p) => (
                <option key={p.id_programa} value={p.id_programa}>
                  {p.nombre_programa}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Periodo Académico</label>
            <select
              value={id_periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              <option value="">Selecciona periodo...</option>
              {periodos.map(p => (
                <option key={p.id_periodo} value={p.id_periodo}>{p.codigo_periodo}</option>
              ))}
            </select>
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
            <div className="text-sm text-emerald-700">{result.message}</div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Finalizar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetalleCobroModal({ cobro, estudiante, codigosDetalle, onClose }) {
  const [showPdf, setShowPdf] = useState(false);
  const getCodeName = (id) => codigosDetalle.find(c => String(c.id_codigo_detalle) === String(id))?.descripcion ?? "Concepto desconocido";

  return (
    <Modal title="Detalle y Vista Previa del Volante" hint={`N° Volante: ${cobro.numero_volante || cobro.id_volante}`} onClose={onClose}>
      <div className="space-y-5 animate-fadeIn">
        {/* Selector de Pestaña */}
        <div className="flex border-b border-app-border/80 gap-4">
          <button
            type="button"
            onClick={() => setShowPdf(false)}
            className={`pb-2 text-xs font-bold transition-all border-b-2 ${!showPdf ? "border-app-accent text-foreground" : "border-transparent text-app-muted hover:text-foreground/80"}`}
          >
            📋 Desglose Técnico
          </button>
          <button
            type="button"
            onClick={() => setShowPdf(true)}
            className={`pb-2 text-xs font-bold transition-all border-b-2 ${showPdf ? "border-app-accent text-foreground" : "border-transparent text-app-muted hover:text-foreground/80"}`}
          >
            📄 Previsualización PDF
          </button>
        </div>

        {!showPdf ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 border border-app-border dark:bg-zinc-900/30">
              <div>
                <div className="text-[10px] uppercase font-bold text-app-muted tracking-wider">Estudiante</div>
                <div className="text-sm font-semibold text-foreground">{cobro.estudiante_nombre}</div>
                <div className="text-xs text-app-muted">ID: {cobro.id_estudiante}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-app-muted tracking-wider">Periodo / Vigencia</div>
                <div className="text-sm font-semibold text-foreground">{cobro.id_periodo}</div>
                <div className="text-xs text-app-muted">Estado: <span className="font-bold text-app-accent">{cobro.estado}</span></div>
              </div>
            </div>

            <div>
              <table className="w-full text-sm">
                <thead className="text-left text-[10px] uppercase font-bold text-app-muted border-b border-app-border">
                  <tr>
                    <th className="pb-2">Concepto Liquidado</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border/50">
                   {cobro.detalles && cobro.detalles.length > 0 ? (
                     cobro.detalles.map((det, idx) => (
                       <tr key={idx}>
                          <td className="py-3 text-foreground/80 font-medium">{getCodeName(det.id_codigo_detalle)}</td>
                          <td className="py-3 text-right font-semibold text-foreground">{formatCurrency(det.valor_unitario)}</td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                        <td className="py-3 text-foreground/80 font-medium">Cobro de Matrícula ({cobro.modalidad_cobro})</td>
                        <td className="py-3 text-right font-semibold text-foreground">{formatCurrency(cobro.total)}</td>
                     </tr>
                   )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-app-border font-bold text-foreground">
                    <td className="pt-4 text-xs tracking-wider text-app-muted">TOTAL LIQUIDADO</td>
                    <td className="pt-4 text-right text-base text-app-accent font-black">{formatCurrency(cobro.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[10px] text-app-muted italic text-center">
              Renderizando vista de impresión nativa generada por el servidor...
            </div>
            <iframe
              src={`/api/cobros/${cobro.id_volante}/pdf`}
              title={`PDF Volante ${cobro.numero_volante}`}
              className="w-full h-[400px] rounded-xl border border-app-border bg-white shadow-inner"
            />
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-app-border">
          <a
            href={`/api/cobros/${cobro.id_volante}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm">
              🖨️ Abrir PDF en pestaña externa
            </Button>
          </a>
          <Button onClick={onClose}>Cerrar Panel</Button>
        </div>
      </div>
    </Modal>
  );
}
