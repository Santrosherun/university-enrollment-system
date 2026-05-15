"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

const formatCurrency = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);
};

export default function PagosPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [cobrosPendientes, setCobrosPendientes] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [codigosDetalle, setCodigosDetalle] = useState([]);

  const [formData, setFormData] = useState({
    id_volante_matricula: "",
    id_codigo_detalle: "",
    valor_pagado: 0,
    referencia_pago: "",
    canal_pago: "TRANSFERENCIA",
    fecha: new Date().toISOString().split("T")[0],
  });

  async function loadData() {
    try {
      const [resEst, resCodes] = await Promise.all([
        fetch("/api/estudiantes"),
        fetch("/api/codigos-detalle")
      ]);
      const [dataEst, dataCodes] = await Promise.all([
        resEst.json(),
        resCodes.json()
      ]);
      setEstudiantes(dataEst.items ?? []);
      setCodigosDetalle(dataCodes.items ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPendientes(estId) {
    if (!estId) {
      setCobrosPendientes([]);
      setBalanceData(null);
      return;
    }
    setLoading(true);
    try {
      const [resCobros, resBalance] = await Promise.all([
        fetch(`/api/cobros?estudianteId=${estId}&estado=GENERADO,PARCIAL`),
        fetch(`/api/estudiantes/${estId}/cuenta-corriente`)
      ]);
      
      const checkRes = async (res) => {
        const ct = res.headers.get("content-type");
        if (!res.ok || !ct || !ct.includes("application/json")) {
           return null;
        }
        return res.json();
      };

      const [jsonCobros, jsonBalance] = await Promise.all([
        checkRes(resCobros),
        checkRes(resBalance)
      ]);

      const estIdNum = Number(estId);
      setCobrosPendientes(
        jsonCobros?.items?.filter(c => (c.estado === "GENERADO" || c.estado === "PARCIAL") && Number(c.id_estudiante) === estIdNum) ?? []
      );
      setBalanceData(jsonBalance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPendientes(selectedEst);
    setFormData((prev) => ({ ...prev, id_volante_matricula: "", valor_pagado: 0 }));
    setMessage(null);
  }, [selectedEst]);

  async function handleSelectCobro(e) {
    const id = e.target.value;
    const cobro = cobrosPendientes.find((c) => String(c.id_volante) === String(id));
    const firstCode = codigosDetalle.find(c => c.grupo === "PAGO" || c.tipo_codigo === "PAGO")?.id_codigo_detalle ?? "";
    setFormData((prev) => ({
      ...prev,
      id_volante_matricula: id,
      id_codigo_detalle: prev.id_codigo_detalle || firstCode,
      valor_pagado: cobro ? (cobro.saldo_pendiente ?? cobro.total) : 0,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedEst || !formData.valor_pagado) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const payloadBody = {
        id_volante_matricula: Number(formData.id_volante_matricula),
        valor_pagado: Number(formData.valor_pagado),
        referencia_pago: formData.referencia_pago,
        canal_pago: formData.canal_pago,
        id_codigo_detalle: formData.id_codigo_detalle ? Number(formData.id_codigo_detalle) : null,
      };

      const res = await fetch("/api/recaudos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payloadBody),
      });

      if (!res.ok) {
         const payload = await res.json().catch(() => null);
         throw new Error(payload?.message ?? "Error al procesar el pago.");
      }

      setMessage({ type: "success", text: "¡Pago registrado exitosamente!" });
      await loadPendientes(selectedEst);
      setFormData({
        id_volante_matricula: "",
        valor_pagado: 0,
        referencia_pago: "",
        canal_pago: "TRANSFERENCIA",
        fecha: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Simulación de pagos
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-app-muted">
          Registra el recaudo de matrículas y servicios para actualizar el balance del estudiante.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lado Izquierdo: Selección y Deuda */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
            <label className="text-sm font-medium text-foreground">
              Estudiante que realiza el pago
            </label>
            <select
              value={selectedEst}
              onChange={(e) => setSelectedEst(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              <option value="">-- Buscar estudiante --</option>
              {estudiantes.map((e) => (
                <option key={e.id_estudiante} value={e.id_estudiante}>
                  {e.numero_identificacion} - {e.primer_nombre} {e.primer_apellido}
                </option>
              ))}
            </select>
          </div>

          {selectedEst && (
            <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Deudas Pendientes</h3>
              {loading ? (
                <div className="mt-4 text-xs text-app-muted">Consultando cartera...</div>
              ) : ((balanceData?.summary?.balance ?? balanceData?.balance ?? 0) > 0 || cobrosPendientes.length > 0) ? (
                <div className="mt-4 space-y-3">
                  {cobrosPendientes.map((c) => (
                    <div key={c.id_volante} className="flex items-center justify-between rounded-xl border border-app-border/60 bg-zinc-50 p-3">
                      <div>
                        <div className="text-xs font-bold text-app-muted uppercase tracking-wider">{c.id_periodo}</div>
                        <div className="text-sm font-medium text-foreground">Volante {c.numero_volante}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-app-accent">{formatCurrency(c.saldo_pendiente ?? c.total)}</div>
                        <div className="text-[10px] text-amber-600 font-medium italic">Pendiente</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-app-border mt-4 flex justify-between items-end">
                    <span className="text-xs font-semibold text-app-muted">TOTAL DEUDA ACUMULADA:</span>
                    <span className="text-xl font-black text-foreground">
                      {formatCurrency(balanceData?.summary?.balance ?? balanceData?.balance ?? cobrosPendientes.reduce((acc, curr) => acc + Number(curr.saldo_pendiente ?? curr.total), 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                  <div className="text-xl">✅</div>
                  <div className="text-sm font-medium text-emerald-800">El estudiante está al día.</div>
                  <div className="text-xs text-emerald-600">No tiene cobros pendientes o tiene saldo a favor.</div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Lado Derecho: Formulario de Pago */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Registrar nuevo pago</h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Volante a Pagar</label>
              <select
                value={formData.id_volante_matricula}
                onChange={handleSelectCobro}
                disabled={!selectedEst || cobrosPendientes.length === 0}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                required
              >
                <option value="">-- Selecciona el volante --</option>
                {cobrosPendientes.map((c) => (
                  <option key={c.id_volante} value={c.id_volante}>
                    {c.numero_volante} ({formatCurrency(c.saldo_pendiente ?? c.total)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Concepto / Tipo de Movimiento</label>
              <select
                value={formData.id_codigo_detalle}
                onChange={(e) => setFormData({ ...formData, id_codigo_detalle: e.target.value })}
                disabled={!selectedEst}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                required
              >
                <option value="">-- Selecciona concepto --</option>
                {codigosDetalle.filter(c => c.grupo === "PAGO" || c.tipo_codigo === "PAGO").map(c => (
                  <option key={c.id_codigo_detalle} value={c.id_codigo_detalle}>
                    {c.descripcion || c.nombre_codigo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Valor del Pago</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted">$</span>
                <input
                  type="number"
                  value={formData.valor_pagado}
                  onChange={(e) => setFormData({ ...formData, valor_pagado: e.target.value })}
                  disabled={!selectedEst}
                  className="w-full rounded-xl border border-app-border bg-app-surface pl-7 pr-3 py-2.5 text-sm font-bold text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Referencia de Pago</label>
              <input
                value={formData.referencia_pago}
                onChange={(e) => setFormData({ ...formData, referencia_pago: e.target.value })}
                disabled={!selectedEst}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                placeholder="Ej: TRANS-123456"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Canal</label>
                <select
                  value={formData.canal_pago}
                  onChange={(e) => setFormData({ ...formData, canal_pago: e.target.value })}
                  disabled={!selectedEst}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                >
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="CAJA">Caja / Efectivo</option>
                  <option value="PSE">PSE / Online</option>
                  <option value="TARJETA">Tarjeta</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Fecha de Pago</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  disabled={!selectedEst}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`rounded-xl p-3 text-xs font-medium border ${
                message.type === "success" 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : "bg-red-50 border-red-100 text-red-800"
              }`}>
                {message.text}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full py-4 text-base shadow-lg shadow-app-accent/20"
                disabled={submitting || !selectedEst || !formData.valor_pagado}
              >
                {submitting ? "Procesando pago..." : "Confirmar y Registrar Pago"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


