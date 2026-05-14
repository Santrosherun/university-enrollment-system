import Link from "next/link";

export default function Sidebar({ items, currentPath }) {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:gap-5 md:border-r md:border-app-border md:bg-app-surface md:px-5 md:py-7 md:shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.02)] sticky top-0 max-h-screen overflow-y-auto shrink-0 no-scrollbar">
      <div className="px-1">
        <div className="text-sm font-semibold tracking-tight text-foreground">
          Matrículas U.
        </div>
        <div className="mt-0.5 text-xs text-app-muted">
          Universidad Privada (Caribe)
        </div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {items.map((item) => {
          const active =
            currentPath === item.href ||
            (item.href !== "/dashboard" && currentPath?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-app-accent/30",
                active
                  ? "bg-app-accent text-white shadow-sm"
                  : "text-foreground/90 hover:bg-app-bg hover:text-foreground",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

