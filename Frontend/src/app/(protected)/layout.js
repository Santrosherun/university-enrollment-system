import { cookies } from "next/headers";
import { NAV_ITEMS, Roles, allowedNavItemsForRole, filterNavItemsByRoutes } from "@/lib/navigation";
import ProtectedShell from "@/components/layout/ProtectedShell";

function safeRole(value) {
  return Object.values(Roles).includes(value) ? value : null;
}

export default async function ProtectedLayout({ children }) {
  const cookieStore = await cookies();
  const role = safeRole(cookieStore.get("ues_role")?.value);
  const token = cookieStore.get("ues_session")?.value;
  
  let items = [];
  let allowedRoutes = [];

  // Intentar obtener permisos dinámicos del backend
  if (token && process.env.NEXT_PUBLIC_API_URL) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 0 } // No cachear para ver cambios de permisos al recargar
      });
      if (res.ok) {
        const user = await res.json();
        allowedRoutes = user.allowed_routes || [];
      }
    } catch (err) {
      console.error("Error fetching dynamic permissions:", err);
    }
  }

  // Si tenemos rutas dinámicas, las usamos. Si no, fallback al hardcoded por rol.
  if (allowedRoutes.length > 0) {
    items = filterNavItemsByRoutes(allowedRoutes);
  } else {
    items = role ? allowedNavItemsForRole(role) : [NAV_ITEMS[0]];
  }

  return (
    <ProtectedShell role={role} items={items} allowedRoutes={allowedRoutes}>
      {children}
    </ProtectedShell>
  );
}

