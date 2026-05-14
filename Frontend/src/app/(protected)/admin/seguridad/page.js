"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Roles } from "@/lib/navigation";

export default function SeguridadAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      // Usaremos el endpoint de usuarios si existe, si no, crearemos uno
      const res = await fetch("/api/usuarios");
      if (!res.ok) throw new Error("Error al cargar usuarios.");
      const json = await res.json();
      setItems(json.items ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Usuarios / Roles / Menús
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Administra los accesos al sistema y define los roles de cada funcionario.
          </p>
        </div>
        <Button onClick={() => { setEditingUser(null); setShowModal(true); }}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-app-muted">Cargando usuarios...</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-app-muted">
                <tr className="border-b border-app-border">
                  <th className="py-3 pr-4">Nombre</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Rol</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id} className="border-b border-app-border/70 hover:bg-zinc-50/50">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-foreground">{user.nombre}</div>
                    </td>
                    <td className="py-4 pr-4 text-app-muted">{user.email}</td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        user.rol === "ADMIN" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                        user.rol === "SUPERVISOR" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        "bg-zinc-50 text-zinc-700 border border-zinc-100"
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setShowModal(true); }}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <UserFormModal 
          user={editingUser} 
          onClose={() => setShowModal(false)} 
          onSuccess={loadData} 
        />
      )}
    </div>
  );
}

function UserFormModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState(user ? {
    primer_nombre: user.nombre.split(" ")[0] || "",
    primer_apellido: user.nombre.split(" ").slice(1).join(" ") || "",
    username: user.email.split("@")[0] || "", // Valor por defecto si es edición
    email: user.email,
    rol: user.rol === "ADMIN" ? "ADMINISTRADOR" : (user.rol || "ASISTENTE"),
    tipo_documento: user.tipo_documento || "CC",
    numero_documento: user.numero_documento || "",
    telefono_contacto: user.telefono_contacto || "",
  } : {
    primer_nombre: "",
    primer_apellido: "",
    username: "",
    email: "",
    password: "",
    rol: "ASISTENTE",
    tipo_documento: "CC",
    numero_documento: "",
    telefono_contacto: ""
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = user ? "PUT" : "POST";
      const url = user ? `/api/usuarios/${user.id}` : "/api/usuarios";
      
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al guardar usuario.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-app-border bg-app-surface p-8 shadow-2xl">
        <h3 className="text-2xl font-bold text-foreground">
          {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </h3>
        <p className="text-sm text-app-muted mt-1 mb-8">Completa la información del funcionario para el sistema.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sección: Identificación */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-app-accent/70">Identificación</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] font-bold text-app-muted uppercase">Tipo</label>
                  <select 
                    value={formData.tipo_documento}
                    onChange={e => setFormData({...formData, tipo_documento: e.target.value})}
                    className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="TI">TI</option>
                    <option value="PP">PP</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-app-muted uppercase">Número de Documento</label>
                  <input 
                    value={formData.numero_documento}
                    onChange={e => setFormData({...formData, numero_documento: e.target.value})}
                    className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-app-muted uppercase">Primer Nombre</label>
                <input 
                  value={formData.primer_nombre}
                  onChange={e => setFormData({...formData, primer_nombre: e.target.value})}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-app-muted uppercase">Primer Apellido</label>
                <input 
                  value={formData.primer_apellido}
                  onChange={e => setFormData({...formData, primer_apellido: e.target.value})}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-app-muted uppercase">Teléfono de Contacto</label>
                <input 
                  value={formData.telefono_contacto}
                  onChange={e => setFormData({...formData, telefono_contacto: e.target.value})}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                />
              </div>
            </div>

            {/* Sección: Acceso */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-app-accent/70">Acceso al Sistema</h4>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-app-muted uppercase">Nombre de Usuario (Login)</label>
                <input 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  placeholder="ej: cmendoza"
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-app-muted uppercase">Email Institucional</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                  required
                />
              </div>
              {!user && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-app-muted uppercase">Contraseña Inicial</label>
                  <input 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                    required
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-app-muted uppercase">Rol de Acceso</label>
                <select 
                  value={formData.rol}
                  onChange={e => setFormData({...formData, rol: e.target.value})}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                >
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="ASISTENTE">ASISTENTE</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-app-border">
            <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : (user ? "Actualizar Datos" : "Crear Usuario")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


