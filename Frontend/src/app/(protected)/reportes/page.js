"use client";

import { useEffect, useState, useMemo } from "react";
import Button from "@/components/ui/Button";

const formatCurrency = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);
};

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState("resumen"); // resumen, esperado, pendientes, real, creditos
  const [periodo, setPeriodo] = useState("2024-1");
  const [loading, setLoading] = useState(true);
  
  // Dashboard Metrics
  const [dashboard, setDashboard] = useState(null);
  // View Lists
  const [resumenEstudiantes, setResumenEstudiantes] = useState([]);
  const [ingresoEsperado, setIngresoEsperado] = useState([]);
  const [pendientesPago, setPendientesPago] = useState([]);
  const [ingresoReal, setIngresoReal] = useState([]);
  const [creditosFinancieros, setCreditosFinancieros] = useState([]);
  
  // Programas Académicos para el Reporte #3
  const [programas, setProgramas] = useState([]);
  const [selectedPrograma, setSelectedPrograma] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      // 1. Cargar KPI del dashboard y programas
      const [resDash, resProg] = await Promise.all([
        fetch(`/api/reportes/financieros?periodo=${periodo}`),
        fetch("/api/programas")
      ]);
      const [dataDash, dataProg] = await Promise.all([
        resDash.json().catch(() => null),
        resProg.json().catch(() => null)
      ]);
      setDashboard(dataDash);
      setProgramas(dataProg?.items ?? []);

      // 2. Cargar las 5 vistas nativas de BD mapeadas por backend
      const endpoints = [
        "resumen-estudiantes",
        "ingreso-esperado",
        "pendientes-pago",
        "ingreso-real",
        "creditos-financieros"
      ];

      const viewResponses = await Promise.all(
        endpoints.map(ep => fetch(`/api/reportes/vistas?endpoint=${ep}`).then(r => r.json().catch(() => [])))
      );

      setResumenEstudiantes(Array.isArray(viewResponses[0]) ? viewResponses[0] : []);
      setIngresoEsperado(Array.isArray(viewResponses[1]) ? viewResponses[1] : []);
      setPendientesPago(Array.isArray(viewResponses[2]) ? viewResponses[2] : []);
      setIngresoReal(Array.isArray(viewResponses[3]) ? viewResponses[3] : []);
      setCreditosFinancieros(Array.isArray(viewResponses[4]) ? viewResponses[4] : []);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [periodo]);

  // Filtro de estudiantes pendientes por programa académico (Reporte #3)
  const pendientesFiltrados = useMemo(() => {
    if (!selectedPrograma) return [];
    return pendientesPago.filter(p => {
      // Comparamos id o nombre según disponibilidad
      const matchId = p.id_programa && String(p.id_programa) === String(selectedPrograma);
      const matchName = p.nombre_programa && p.nombre_programa.toLowerCase() === selectedPrograma.toLowerCase();
      // Si el select usa el nombre como value o el id
      return matchId || matchName || p.nombre_programa?.includes(selectedPrograma);
    });
  }, [pendientesPago, selectedPrograma]);

  // Cálculos totales globales
  const totalEsperadoAcumulado = useMemo(() => {
    return ingresoEsperado.reduce((acc, curr) => acc + Number(curr.ingreso_esperado_total || 0), 0);
  }, [ingresoEsperado]);

  const totalRealAcumulado = useMemo(() => {
    return ingresoReal.reduce((acc, curr) => acc + Number(curr.ingreso_real_recibido || 0), 0);
  }, [ingresoReal]);

  const totalCarteraObjetivo = useMemo(() => {
    return creditosFinancieros.reduce((acc, curr) => acc + Number(curr.valor_credito || 0), 0);
  }, [creditosFinancieros]);

  const tabs = [
    { id: "resumen", label: "1. Listado General Estudiantes" },
    { id: "esperado", label: "2. Ingreso Esperado (Facturado)" },
    { id: "pendientes", label: "3. Pendientes de Pago (Por Programa)" },
    { id: "real", label: "4. Ingreso Real Recibido" },
    { id: "creditos", label: "5. Créditos & Cartera Objetivo" },
  ];

  return (
    <div className="space-y-7 pb-12">
      {/* Header y Selector Global */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Reportes & Auditoría Financiera
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Vistas consolidadas nativas del sistema para análisis estratégico de matrículas y recaudos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadData}>
            🔄 Recargar
          </Button>
          <div className="flex items-center gap-2 bg-app-surface px-3 py-1.5 rounded-xl border border-app-border">
            <label className="text-xs font-bold text-app-muted uppercase">Filtro Periodo:</label>
            <select 
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="bg-transparent text-sm text-foreground font-semibold outline-none cursor-pointer"
            >
              <option value="2024-1">2024-1</option>
              <option value="2023-2">2023-2</option>
              <option value="">Todos (Histórico)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tarjetas Superiores de Indicadores Rápidos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-xl opacity-20">📊</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Ingreso Esperado (Bruto)</div>
          <div className="mt-1 text-2xl font-black text-foreground">
            {formatCurrency(dashboard?.vista_facturacion?.total_bruto || totalEsperadoAcumulado)}
          </div>
          <div className="text-[10px] text-app-muted mt-1">Meta global del periodo</div>
        </div>
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-xl opacity-20">💰</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Ingreso Real en Caja</div>
          <div className="mt-1 text-2xl font-black text-emerald-600">
            {formatCurrency(dashboard?.vista_ingreso_real?.total_recaudado || totalRealAcumulado)}
          </div>
          <div className="text-[10px] text-emerald-600/80 font-medium mt-1">Recaudo consolidado</div>
        </div>
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-xl opacity-20">📈</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Cartera por Cobrar</div>
          <div className="mt-1 text-2xl font-black text-red-500">
            {formatCurrency(dashboard?.vista_cartera?.total_pendiente || Math.max(0, totalEsperadoAcumulado - totalRealAcumulado))}
          </div>
          <div className="text-[10px] text-red-500/80 font-medium mt-1">Pendiente de liquidación</div>
        </div>
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm relative overflow-hidden">
          <div className="absolute right-3 top-3 text-xl opacity-20">⚡</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Efectividad de Recaudo</div>
          <div className="mt-1 text-2xl font-black text-app-accent">
            {dashboard?.vista_ingreso_real?.efectividad_porcentaje 
              ? dashboard.vista_ingreso_real.efectividad_porcentaje.toFixed(1) 
              : totalEsperadoAcumulado > 0 ? ((totalRealAcumulado / totalEsperadoAcumulado) * 100).toFixed(1) : 0}%
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div 
              className="h-full bg-app-accent transition-all duration-500" 
              style={{ 
                width: `${dashboard?.vista_ingreso_real?.efectividad_porcentaje || (totalEsperadoAcumulado > 0 ? (totalRealAcumulado / totalEsperadoAcumulado) * 100 : 0)}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="border-b border-app-border">
        <nav className="-mb-px flex flex-wrap gap-2" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all duration-200 rounded-t-xl border-t border-x ${
                  isActive
                    ? "border-app-border bg-app-surface text-app-accent shadow-sm"
                    : "border-transparent text-app-muted hover:text-foreground hover:bg-app-surface/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenedor de las Vistas Mapeadas */}
      <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-app-muted space-y-2">
            <div className="text-xl animate-spin">⏳</div>
            <div className="text-xs">Consultando y cruzando vistas nativas...</div>
          </div>
        ) : (
          <>
            {/* VISTA 1: Listado de Estudiantes (Programa, Modalidad, Monto) */}
            {activeTab === "resumen" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-app-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase text-foreground">Listado de Estudiantes & Volantes</h3>
                    <p className="text-xs text-app-muted">Estructura combinada de estudiantes, programas vinculados y modalidad impositiva.</p>
                  </div>
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full font-bold text-app-muted">
                    {resumenEstudiantes.length} registros
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[10px] uppercase tracking-wider text-app-muted bg-zinc-50 dark:bg-zinc-900">
                      <tr>
                        <th className="p-3 rounded-l-lg">Estudiante</th>
                        <th className="p-3">Documento</th>
                        <th className="p-3">Programa Académico</th>
                        <th className="p-3">Modalidad Cobro</th>
                        <th className="p-3 text-right">Monto Facturado</th>
                        <th className="p-3 rounded-r-lg text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/60">
                      {resumenEstudiantes.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-3 font-semibold text-foreground">{item.nombre_estudiante || "---"}</td>
                          <td className="p-3 text-xs text-app-muted">{item.numero_documento || "---"}</td>
                          <td className="p-3 text-xs font-medium text-foreground/90">{item.nombre_programa || "---"}</td>
                          <td className="p-3">
                            <span className="text-[10px] bg-app-accent/10 text-app-accent px-2 py-0.5 rounded font-bold border border-app-accent/20">
                              {item.modalidad_cobro || "CRÉDITO"}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-foreground">
                            {formatCurrency(item.monto_volante ?? 0)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              item.estado_volante === "PAGADO" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {item.estado_volante || "GENERADO"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {resumenEstudiantes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-xs text-app-muted">
                            No se encontraron registros de estudiantes para este periodo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VISTA 2: Ingreso Esperado Totalizado por Programa */}
            {activeTab === "esperado" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-app-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase text-foreground">Ingreso Esperado por Programa</h3>
                    <p className="text-xs text-app-muted">Totalización de facturación bruta proyectada por unidad académica.</p>
                  </div>
                  <span className="text-xs text-app-accent font-bold">Vista Agrupada</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[10px] uppercase tracking-wider text-app-muted bg-zinc-50 dark:bg-zinc-900">
                      <tr>
                        <th className="p-3 rounded-l-lg">Periodo</th>
                        <th className="p-3">Programa Académico</th>
                        <th className="p-3 text-center">Estudiantes Matriculados</th>
                        <th className="p-3 text-right rounded-r-lg">Ingreso Total Esperado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/60">
                      {ingresoEsperado.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-3 font-bold text-app-muted">{item.codigo_periodo || periodo}</td>
                          <td className="p-3 font-semibold text-foreground">{item.nombre_programa || "---"}</td>
                          <td className="p-3 text-center font-bold text-app-accent bg-app-accent/5 rounded-lg">
                            {item.total_estudiantes || 0}
                          </td>
                          <td className="p-3 text-right font-black text-foreground text-base">
                            {formatCurrency(item.ingreso_esperado_total ?? 0)}
                          </td>
                        </tr>
                      ))}
                      {ingresoEsperado.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-xs text-app-muted">
                            No hay proyección de ingresos calculada para este periodo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-zinc-50 dark:bg-zinc-900 font-bold border-t-2 border-app-border">
                      <tr>
                        <td colSpan={3} className="p-3 text-right text-xs text-app-muted uppercase">Total Ingreso Esperado Consolidado:</td>
                        <td className="p-3 text-right text-lg text-app-accent font-black">{formatCurrency(totalEsperadoAcumulado)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* VISTA 3: Estudiantes Pendientes de Pago con Selección de Programa Obligatoria */}
            {activeTab === "pendientes" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-app-surface border-2 border-app-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-black uppercase text-app-accent tracking-wider">Paso Requerido para Reporte</h3>
                    <p className="text-xs text-foreground mt-0.5">
                      Para ver los estudiantes en mora, debes <strong>seleccionar el programa académico</strong> a auditar:
                    </p>
                  </div>
                  <select
                    value={selectedPrograma}
                    onChange={(e) => setSelectedPrograma(e.target.value)}
                    className="w-full sm:w-auto min-w-[240px] rounded-xl border-2 border-app-accent bg-app-surface px-3 py-2 text-sm text-foreground outline-none font-bold shadow-sm cursor-pointer"
                  >
                    <option value="">-- Selecciona Programa Académico --</option>
                    {programas.map((prog) => (
                      <option key={prog.id_programa} value={prog.nombre_programa}>
                        {prog.nombre_programa}
                      </option>
                    ))}
                    {/* Opciones de respaldo por si el array de programas está vacío */}
                    <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                    <option value="Medicina">Medicina</option>
                    <option value="Administración de Empresas">Administración de Empresas</option>
                  </select>
                </div>

                {!selectedPrograma ? (
                  <div className="py-16 px-4 text-center border-2 border-dashed border-app-border rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="text-3xl mb-2">📋</div>
                    <h4 className="text-sm font-bold text-foreground">Reporte Bloqueado por Filtro</h4>
                    <p className="text-xs text-app-muted max-w-md mx-auto mt-1">
                      Por favor selecciona un programa académico en el menú desplegable superior para cargar instantáneamente la nómina de estudiantes con saldos deudores pendientes en este periodo.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center text-xs text-app-muted px-1">
                      <span>Mostrando deudores para: <strong className="text-foreground">{selectedPrograma}</strong></span>
                      <span>{pendientesFiltrados.length} estudiantes en mora</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-[10px] uppercase tracking-wider text-app-muted bg-zinc-50 dark:bg-zinc-900">
                          <tr>
                            <th className="p-3 rounded-l-lg">Estudiante Deudor</th>
                            <th className="p-3">Documento</th>
                            <th className="p-3">Volante Asignado</th>
                            <th className="p-3 text-right">Facturado</th>
                            <th className="p-3 text-right">Abonado</th>
                            <th className="p-3 text-right rounded-r-lg text-red-600 font-bold">Saldo Pendiente</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border/60">
                          {pendientesFiltrados.map((item, idx) => (
                            <tr key={idx} className="hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-colors">
                              <td className="p-3 font-bold text-foreground">{item.nombre_estudiante || "---"}</td>
                              <td className="p-3 text-xs text-app-muted">{item.numero_documento || "---"}</td>
                              <td className="p-3 text-xs">
                                <span className="font-semibold text-foreground">Volante #{item.numero_volante || "N/A"}</span>
                              </td>
                              <td className="p-3 text-right text-xs text-app-muted">
                                {formatCurrency(item.monto_esperado ?? 0)}
                              </td>
                              <td className="p-3 text-right text-xs text-emerald-600 font-medium">
                                {formatCurrency(item.monto_pagado ?? 0)}
                              </td>
                              <td className="p-3 text-right font-black text-red-600 bg-red-50/40 dark:bg-red-950/20 text-base">
                                {formatCurrency(item.saldo_pendiente ?? item.monto_esperado ?? 0)}
                              </td>
                            </tr>
                          ))}
                          {pendientesFiltrados.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-xs text-emerald-700 font-medium bg-emerald-50/30">
                                ✅ ¡Excelente noticia! No hay estudiantes con saldos pendientes reportados para el programa de {selectedPrograma}.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {pendientesFiltrados.length > 0 && (
                          <tfoot className="bg-red-50/50 dark:bg-red-950/20 font-bold border-t border-red-200">
                            <tr>
                              <td colSpan={5} className="p-3 text-right text-xs text-red-800 uppercase">Cartera Total en Mora del Programa:</td>
                              <td className="p-3 text-right text-base text-red-600 font-black">
                                {formatCurrency(pendientesFiltrados.reduce((a, b) => a + Number(b.saldo_pendiente ?? b.monto_esperado ?? 0), 0))}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VISTA 4: Ingreso Real Recibido */}
            {activeTab === "real" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-app-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase text-foreground">Ingreso Real Recibido</h3>
                    <p className="text-xs text-app-muted">Flujo de caja efectivo registrado y aprobado por programa.</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold">Caja Efectiva</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[10px] uppercase tracking-wider text-app-muted bg-zinc-50 dark:bg-zinc-900">
                      <tr>
                        <th className="p-3 rounded-l-lg">Periodo Auditado</th>
                        <th className="p-3">Programa Académico</th>
                        <th className="p-3 text-right rounded-r-lg">Ingreso Real Consolidado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/60">
                      {ingresoReal.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-3 font-bold text-app-muted">{item.codigo_periodo || periodo}</td>
                          <td className="p-3 font-semibold text-foreground">{item.nombre_programa || "---"}</td>
                          <td className="p-3 text-right font-black text-emerald-600 text-base">
                            {formatCurrency(item.ingreso_real_recibido ?? 0)}
                          </td>
                        </tr>
                      ))}
                      {ingresoReal.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-12 text-center text-xs text-app-muted">
                            Aún no se han registrado ingresos aprobados en caja para los programas de este periodo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-emerald-50/30 font-bold border-t-2 border-emerald-200">
                      <tr>
                        <td colSpan={2} className="p-3 text-right text-xs text-emerald-800 uppercase">Total Ingreso Real Mapeado:</td>
                        <td className="p-3 text-right text-lg text-emerald-600 font-black">{formatCurrency(totalRealAcumulado)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* VISTA 5: Estudiantes con Crédito Financiero y Totalizador de Cartera Objetivo */}
            {activeTab === "creditos" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-app-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase text-foreground">Créditos Financieros & Cartera Objetivo</h3>
                    <p className="text-xs text-app-muted">Auditoría de convenios crediticios (ICETEX, Entidades) y cálculo del objetivo central de cartera.</p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-bold border border-indigo-200">
                    Cuentas por Cobrar
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-[10px] uppercase tracking-wider text-app-muted bg-zinc-50 dark:bg-zinc-900">
                      <tr>
                        <th className="p-3 rounded-l-lg">Beneficiario del Crédito</th>
                        <th className="p-3">Documento</th>
                        <th className="p-3">Programa Académico</th>
                        <th className="p-3 text-right rounded-r-lg">Valor del Crédito Financiado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/60">
                      {creditosFinancieros.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="p-3 font-bold text-foreground">{item.nombre_estudiante || "---"}</td>
                          <td className="p-3 text-xs text-app-muted">{item.numero_documento || "---"}</td>
                          <td className="p-3 text-xs font-medium text-foreground/90">{item.nombre_programa || "---"}</td>
                          <td className="p-3 text-right font-bold text-indigo-600">
                            {formatCurrency(item.valor_credito ?? 0)}
                          </td>
                        </tr>
                      ))}
                      {creditosFinancieros.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-xs text-app-muted">
                            No se registran estudiantes con modalidad de crédito financiero auditados en este corte.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-indigo-50/40 dark:bg-indigo-950/20 font-bold border-t-2 border-indigo-300">
                      <tr>
                        <td colSpan={3} className="p-4 text-right">
                          <div className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                            Objetivo de Cartera (Cuentas por Cobrar):
                          </div>
                          <div className="text-[10px] text-indigo-600 font-medium">Totalización central de créditos vigentes</div>
                        </td>
                        <td className="p-4 text-right text-xl text-indigo-600 font-black align-middle">
                          {formatCurrency(totalCarteraObjetivo)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Acciones de Impresión / Exportación */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          🖨️ Imprimir / Exportar Reporte Actual
        </Button>
      </div>
    </div>
  );
}
