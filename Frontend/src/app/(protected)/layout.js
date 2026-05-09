import { cookies } from "next/headers";
import { NAV_ITEMS, Roles, allowedNavItemsForRole } from "@/lib/navigation";
import ProtectedShell from "@/components/layout/ProtectedShell";

function safeRole(value) {
  return Object.values(Roles).includes(value) ? value : null;
}

export default async function ProtectedLayout({ children }) {
  const cookieStore = await cookies();
  const role = safeRole(cookieStore.get("ues_role")?.value);
  const items = role ? allowedNavItemsForRole(role) : NAV_ITEMS.slice(0, 1);

  return (
    <ProtectedShell role={role} items={items}>
      {children}
    </ProtectedShell>
  );
}

