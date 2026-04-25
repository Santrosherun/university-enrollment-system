import Link from "next/link";

export default function Sidebar({ items, currentPath }) {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:gap-4 md:border-r md:border-zinc-200 md:bg-white md:px-4 md:py-5">
      <div className="px-2">
        <div className="text-sm font-semibold tracking-tight text-zinc-900">
          Matrículas U.
        </div>
        <div className="text-xs text-zinc-500">
          Universidad Privada (Caribe)
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = currentPath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900",
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

