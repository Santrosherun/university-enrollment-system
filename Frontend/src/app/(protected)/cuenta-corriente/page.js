"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Calendar, 
  User,
  AlertCircle,
  Clock,
  ChevronRight
} from "lucide-react";

const formatCurrency = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function CuentaCorrientePage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);

  const loadInitialData = useCallback(async () => {
    try {
      const [resEst, resPer] = await Promise.all([
        fetch("/api/estudiantes"),
        fetch("/api/periodos")
      ]);
      const jsonEst = await resEst.json();
      const jsonPer = await resPer.json();
      setEstudiantes(jsonEst.items ?? []);
      setPeriodos(jsonPer.items ?? []);
      
      // Seleccionar el periodo activo por defecto si existe
      const activo = (jsonPer.items ?? []).find(p => p.estado === "ACTIVO");
      if (activo) setSelectedPeriodo(activo.id_periodo);
      else if (jsonPer.items?.length > 0) setSelectedPeriodo(jsonPer.items[0].id_periodo);

    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  const loadCuenta = useCallback(async (estId, perId) => {
    if (!estId || !perId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/estudiantes/${estId}/cuenta-corriente?id_periodo=${perId}`);
      if (!res.ok) throw new Error("No se pudo obtener el extracto financiero.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (selectedEst && selectedPeriodo) {
      loadCuenta(selectedEst, selectedPeriodo);
    }
  }, [selectedEst, selectedPeriodo, loadCuenta]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Cuenta Corriente
          </h1>
          <p className="mt-2 text-zinc-500">
            Extracto detallado de movimientos y balance financiero por periodo.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-indigo-700 border border-indigo-100">
          <CreditCard className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Gestión Financiera</span>
        </div>
      </div>

      {/* Selectors Card */}
      <div className="grid gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/50 md:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <User className="h-4 w-4 text-indigo-500" />
            Estudiante
          </label>
          <select
            value={selectedEst}
            onChange={(e) => setSelectedEst(e.target.value)}
            disabled={loadingMeta}
            className="w-full rounded-2xl border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="">Selecciona un estudiante...</option>
            {estudiantes.map((e) => (
              <option key={e.id_estudiante} value={e.id_estudiante}>
                {e.numero_documento} — {e.primer_nombre} {e.primer_apellido}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Calendar className="h-4 w-4 text-indigo-500" />
            Periodo Académico
          </label>
          <select
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
            disabled={loadingMeta}
            className="w-full rounded-2xl border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="">Selecciona un periodo...</option>
            {periodos.map((p) => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.codigo_periodo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl border border-zinc-100 bg-white shadow-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-zinc-500">Analizando registros financieros...</p>
        </div>
      ) : data ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
          {/* Dashboard Summary */}
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Cargos */}
            <div className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-zinc-50 transition-transform group-hover:scale-110"></div>
              <div className="relative flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Cargos</span>
                  <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <span className="mt-4 text-2xl font-black text-zinc-900 md:text-3xl">
                  {formatCurrency(data.total_cargos)}
                </span>
                <p className="mt-2 text-xs text-zinc-400">Conceptos facturados en el periodo</p>
              </div>
            </div>

            {/* Abonos */}
            <div className="group relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-50 transition-transform group-hover:scale-110"></div>
              <div className="relative flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Total Abonos</span>
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                </div>
                <span className="mt-4 text-2xl font-black text-emerald-600 md:text-3xl">
                  {formatCurrency(data.total_abonos)}
                </span>
                <p className="mt-2 text-xs text-emerald-400">Pagos y recaudos confirmados</p>
              </div>
            </div>

            {/* Balance */}
            <div className={`group relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md ${
              data.balance > 0 ? "border-rose-100 bg-rose-50/30" : "border-indigo-100 bg-indigo-50/30"
            }`}>
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full transition-transform group-hover:scale-110 ${
                data.balance > 0 ? "bg-rose-100/50" : "bg-indigo-100/50"
              }`}></div>
              <div className="relative flex flex-col">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    data.balance > 0 ? "text-rose-500" : "text-indigo-500"
                  }`}>Balance Pendiente</span>
                  <div className={`rounded-xl p-2 ${
                    data.balance > 0 ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
                  }`}>
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <span className={`mt-4 text-2xl font-black md:text-3xl ${
                  data.balance > 0 ? "text-rose-600" : "text-indigo-600"
                }`}>
                  {formatCurrency(data.balance)}
                </span>
                <p className="mt-2 text-xs text-zinc-500">Saldo neto actual del estudiante</p>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/40">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-8 py-5">
              <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-800">
                <Clock className="h-5 w-5 text-indigo-500" />
                Historial de Movimientos
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    <th className="px-8 py-4">Fecha</th>
                    <th className="px-4 py-4">Detalle / Concepto</th>
                    <th className="px-4 py-4 text-center">Tipo</th>
                    <th className="px-8 py-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {data.movimientos.map((m, idx) => (
                    <tr key={idx} className="group hover:bg-zinc-50/80 transition-colors">
                      <td className="whitespace-nowrap px-8 py-5 text-sm font-medium text-zinc-500">
                        {formatDate(m.fecha_movimiento)}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900">{m.nombre_codigo}</span>
                          <span className="text-[10px] text-zinc-400">{m.descripcion_adicional}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tighter ${
                          m.tipo_movimiento === "COBRO" 
                            ? "bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-200" 
                            : "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200"
                        }`}>
                          {m.tipo_movimiento === "COBRO" ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownLeft className="h-3 w-3" />
                          )}
                          {m.tipo_movimiento}
                        </span>
                      </td>
                      <td className={`px-8 py-5 text-right font-black ${
                        m.tipo_movimiento === "COBRO" ? "text-zinc-900" : "text-emerald-600"
                      }`}>
                        {m.tipo_movimiento === "PAGO" ? "-" : ""} {formatCurrency(m.valor)}
                      </td>
                    </tr>
                  ))}
                  {data.movimientos.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-12 w-12 text-zinc-200" />
                          <p className="mt-4 text-sm font-medium text-zinc-400">No se encontraron movimientos financieros en este periodo.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedEst ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-3xl border border-zinc-100 bg-white">
          <Calendar className="h-10 w-10 text-zinc-200" />
          <p className="text-sm font-medium text-zinc-400">Selecciona un periodo para visualizar el extracto.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 rounded-[2.5rem] border-2 border-dashed border-zinc-200 bg-white py-24 text-center">
          <div className="relative">
            <div className="absolute -inset-4 animate-pulse rounded-full bg-indigo-50"></div>
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-200">
              <User className="h-10 w-10" />
            </div>
          </div>
          <div className="max-w-xs space-y-2">
            <h3 className="text-xl font-bold text-zinc-900">Empezar Consulta</h3>
            <p className="text-sm text-zinc-400">
              Selecciona un estudiante y el periodo académico para generar su historial financiero detallado.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
            Paso 1: Seleccionar Estudiante
            <ChevronRight className="h-3 w-3" />
            Paso 2: Ver Balance
          </div>
        </div>
      )}
    </div>
  );
}
