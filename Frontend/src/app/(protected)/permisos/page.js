"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function PermisosRbacPage() {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(1);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar listado de roles disponibles
  async function fetchRoles() {
    try {
      const res = await fetch("/api/rbac/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data ?? []);
        if (data && data.length > 0) {
          // Mantener el primer rol seleccionado por defecto
          setSelectedRoleId(data[0].id_rol);
        }
      }
    } catch (err) {
      console.error("Error cargando roles:", err);
    }
  }

  // Cargar matriz de permisos para el rol seleccionado
  async function fetchPermisosMatrix(rolId) {
    setLoading(true);
    setStatusMsg(null);
    setHasChanges(false);
    try {
      const res = await fetch(`/api/rbac/permisos/${rolId}`);
      if (res.ok) {
        const data = await res.json();
        setPermisos(data ?? []);
      } else {
        setPermisos([]);
      }
    } catch (err) {
      console.error("Error cargando matriz de permisos:", err);
      setStatusMsg({ type: "error", text: "Error de red al cargar la matriz de permisos." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchPermisosMatrix(selectedRoleId);
    }
  }, [selectedRoleId]);

  // Manejar el toggle individual de un permiso
  function handleToggle(idMenu, field) {
    setPermisos(prev => {
      return prev.map(p => {
        if (p.id_menu === idMenu) {
          return { ...p, [field]: !p[field] };
        }
        return p;
      });
    });
    setHasChanges(true);
  }

  // Activar/Desactivar todos los permisos de una columna para mayor agilidad
  function handleToggleColumn(field, valueForce) {
    setPermisos(prev => prev.map(p => ({ ...p, [field]: valueForce })));
    setHasChanges(true);
  }

  // Guardar la matriz completa hacia el backend
  async function handleSaveMatrix() {
    setSaving(true);
    setStatusMsg(null);
    try {
      const payload = {
        permisos: permisos.map(p => ({
          id_menu: p.id_menu,
          puede_ver: p.puede_ver,
          puede_crear: p.puede_crear,
          puede_editar: p.puede_editar,
          puede_eliminar: p.puede_eliminar
        }))
      };

      const res = await fetch(`/api/rbac/permisos/${selectedRoleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        setStatusMsg({ type: "success", text: json.message || "Matriz de accesos actualizada correctamente." });
        setHasChanges(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setStatusMsg({ type: "error", text: errorData.message || "Error al procesar la actualización en el servidor." });
      }
    } catch (err) {
      console.error("Error guardando matriz:", err);
      setStatusMsg({ type: "error", text: "Fallo de conexión al intentar guardar los permisos." });
    } finally {
      setSaving(false);
    }
  }

  const activeRoleObj = roles.find(r => r.id_rol === selectedRoleId);

  return (
    <div className="space-y-7 pb-12">
      {/* Encabezado Principal Premium */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-app-accent animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-app-accent">Auditoría y RBAC</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl mt-1">
            Matriz de Control de Accesos
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted max-w-2xl">
            Gestiona de forma granular los permisos de lectura, creación, edición y borrado sobre cada menú del sistema según el rol jerárquico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full animate-bounce">
              ⚠️ Cambios sin guardar
            </span>
          )}
          <Button 
            onClick={handleSaveMatrix} 
            disabled={saving || loading}
            className="shadow-md hover:shadow-lg transition-all duration-200"
          >
            {saving ? "Guardando Matriz..." : "Guardar Configuración"}
          </Button>
        </div>
      </div>

      {/* Alertas de Estado Visuales */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          statusMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-rose-50 border-rose-100 text-rose-800"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-base">{statusMsg.type === "success" ? "✅" : "❌"}</span>
            <p className="text-sm font-medium">{statusMsg.text}</p>
          </div>
        </div>
      )}

      {/* Selector en forma de Tabs Modernas */}
      <div className="border-b border-app-border">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {roles.map(rol => {
            const isSelected = rol.id_rol === selectedRoleId;
            return (
              <button
                key={rol.id_rol}
                onClick={() => setSelectedRoleId(rol.id_rol)}
                className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected 
                    ? "bg-app-accent text-white shadow-md shadow-app-accent/20" 
                    : "bg-app-surface text-app-muted hover:bg-zinc-100 hover:text-foreground border border-app-border/60"
                }`}
              >
                <span className="text-sm">{rol.nombre_rol === "ADMINISTRADOR" ? "👑" : rol.nombre_rol === "SUPERVISOR" ? "🛡️" : "👤"}</span>
                <span>{rol.nombre_rol}</span>
                {rol.es_especial && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    Maestro
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenedor Principal de la Matriz */}
      <div className="rounded-3xl border border-app-border bg-app-surface shadow-sm overflow-hidden transition-all">
        {/* Barra superior de acciones masivas */}
        <div className="bg-zinc-50/70 border-b border-app-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase text-foreground tracking-wide">
              Configurando Perfil: <span className="text-app-accent">{activeRoleObj?.nombre_rol || "Seleccionado"}</span>
            </h3>
            <p className="text-[11px] text-app-muted mt-0.5">
              {activeRoleObj?.descripcion || "Habilita o deshabilita accesos en tiempo real."}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-app-muted mr-1">Selección Global:</span>
            <button 
              onClick={() => handleToggleColumn("puede_ver", true)}
              className="px-2 py-1 rounded bg-white border border-app-border text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              + Ver
            </button>
            <button 
              onClick={() => handleToggleColumn("puede_crear", true)}
              className="px-2 py-1 rounded bg-white border border-app-border text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              + Crear
            </button>
            <button 
              onClick={() => handleToggleColumn("puede_editar", true)}
              className="px-2 py-1 rounded bg-white border border-app-border text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              + Editar
            </button>
            <button 
              onClick={() => handleToggleColumn("puede_eliminar", true)}
              className="px-2 py-1 rounded bg-white border border-app-border text-[10px] font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              + Borrar
            </button>
            <span className="text-app-border mx-1">|</span>
            <button 
              onClick={() => {
                setPermisos(prev => prev.map(p => ({ ...p, puede_ver: false, puede_crear: false, puede_editar: false, puede_eliminar: false })));
                setHasChanges(true);
              }}
              className="px-2 py-1 rounded bg-rose-50 border border-rose-100 text-[10px] font-bold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              Limpiar Todo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-app-border border-t-app-accent mb-2" />
            <p className="text-xs text-app-muted font-medium">Renderizando matriz de permisos...</p>
          </div>
        ) : permisos.length === 0 ? (
          <div className="p-12 text-center text-sm text-app-muted">
            No se encontraron menús activos en la plataforma.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm border-collapse">
              <thead className="bg-app-surface text-[10px] font-black uppercase tracking-wider text-app-muted border-b border-app-border">
                <tr>
                  <th className="py-3.5 pl-6 pr-4">Módulo Institucional</th>
                  <th className="py-3.5 px-4">Ruta Interna</th>
                  <th className="py-3.5 px-4 text-center">Lectura (Ver)</th>
                  <th className="py-3.5 px-4 text-center">Escritura (Crear)</th>
                  <th className="py-3.5 px-4 text-center">Modificación (Editar)</th>
                  <th className="py-3.5 px-4 text-center">Eliminación (Borrar)</th>
                  <th className="py-3.5 pr-6 text-right">Interruptor Maestro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/60">
                {permisos.map((row) => {
                  const isAllChecked = row.puede_ver && row.puede_crear && row.puede_editar && row.puede_eliminar;
                  return (
                    <tr key={row.id_menu} className="hover:bg-zinc-50/40 transition-colors group">
                      <td className="py-4 pl-6 pr-4">
                        <div className="font-bold text-foreground group-hover:text-app-accent transition-colors flex items-center gap-2">
                          <span className="text-xs text-app-muted">📁</span>
                          {row.menu_nombre}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono text-zinc-600">
                          {row.menu_ruta || "/"}
                        </code>
                      </td>

                      {/* Checkbox: VER */}
                      <td className="py-4 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={row.puede_ver}
                            onChange={() => handleToggle(row.id_menu, "puede_ver")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-app-accent"></div>
                        </label>
                      </td>

                      {/* Checkbox: CREAR */}
                      <td className="py-4 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={row.puede_crear}
                            onChange={() => handleToggle(row.id_menu, "puede_crear")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </td>

                      {/* Checkbox: EDITAR */}
                      <td className="py-4 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={row.puede_editar}
                            onChange={() => handleToggle(row.id_menu, "puede_editar")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </td>

                      {/* Checkbox: ELIMINAR */}
                      <td className="py-4 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={row.puede_eliminar}
                            onChange={() => handleToggle(row.id_menu, "puede_eliminar")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </td>

                      {/* Interruptor Global de Fila */}
                      <td className="py-4 pr-6 text-right">
                        <button
                          onClick={() => {
                            const nextState = !isAllChecked;
                            setPermisos(prev => prev.map(p => {
                              if (p.id_menu === row.id_menu) {
                                return { ...p, puede_ver: nextState, puede_crear: nextState, puede_editar: nextState, puede_eliminar: nextState };
                              }
                              return p;
                            }));
                            setHasChanges(true);
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${
                            isAllChecked 
                              ? "bg-app-accent/10 border-app-accent/20 text-app-accent hover:bg-app-accent/20" 
                              : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200"
                          }`}
                        >
                          {isAllChecked ? "Bloque Activo" : "Inactivo"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota descriptiva inferior de soporte */}
      <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4 text-xs text-zinc-500 flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xl">💡</span>
        <p className="leading-relaxed text-center sm:text-left">
          Los cambios realizados en esta matriz se aplican de manera global a todas las sesiones futuras de los usuarios que posean el rol correspondiente. Asegúrate de conservar un rol de administrador central con privilegios plenos para evitar bloqueos del sistema.
        </p>
      </div>
    </div>
  );
}
