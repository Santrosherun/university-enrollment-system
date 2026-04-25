import { cookies } from "next/headers";
import { NAV_ITEMS, Roles, allowedNavItemsForRole } from "@/lib/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

function safeRole(value) {
  return Object.values(Roles).includes(value) ? value : null;
}

export default async function ProtectedLayout({ children }) {
  const cookieStore = await cookies();
  const role = safeRole(cookieStore.get("ues_role")?.value);
  const items = role ? allowedNavItemsForRole(role) : NAV_ITEMS.slice(0, 1);

  // NOTE: Sidebar needs current path for highlighting; in módulo 2 we keep it simple.
  // We'll improve active highlighting when we add a client-side shell.
  const currentPath = "";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex min-h-screen">
        <Sidebar items={items} currentPath={currentPath} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header role={role} />
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

