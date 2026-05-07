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
  const [formData, setFormData] = useState(user ?? {
    nombre: "",
    email: "",
    password: "",
    rol: "ASISTENTE"
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
      
      if (!res.ok) throw new Error("Error al guardar usuario.");
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-6 shadow-xl">
        <h3 className="text-xl font-bold text-foreground">
          {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase">Nombre Completo</label>
            <input 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase">Email</label>
            <input 
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
              required
            />
          </div>
          {!user && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase">Contraseña Inicial</label>
              <input 
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
                required
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-bold text-app-muted uppercase">Rol de Acceso</label>
            <select 
              value={formData.rol}
              onChange={e => setFormData({...formData, rol: e.target.value})}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
            >
              <option value="ADMIN">ADMIN (Acceso Total)</option>
              <option value="SUPERVISOR">SUPERVISOR (Gestión académica)</option>
              <option value="ASISTENTE">ASISTENTE (Caja y Atención)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


