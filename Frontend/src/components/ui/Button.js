"use client";

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 disabled:opacity-60 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-app-accent text-white hover:bg-app-accent-hover active:opacity-95",
    secondary:
      "border border-app-border bg-app-surface text-foreground hover:bg-app-bg hover:border-app-accent/40 active:bg-app-bg",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    ghost: "text-foreground hover:bg-app-bg active:bg-app-bg",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
  };

  return (
    <button
      {...props}
      className={[base, variants[variant], sizes[size], className].join(" ")}
    />
  );
}

