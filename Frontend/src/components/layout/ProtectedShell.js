"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function ProtectedShell({ role, items, children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-app-bg">
      <div className="flex min-h-screen">
        <Sidebar items={items} currentPath={pathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header role={role} />
          <main className="flex-1 px-6 py-8 md:px-10 md:py-10 lg:px-12 lg:py-12">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

