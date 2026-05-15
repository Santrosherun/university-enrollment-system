import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/denied",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
];

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/public/")) return true;
  return false;
}

const ROLE_RULES = [
  { prefix: "/admin", roles: ["ADMINISTRADOR"] },
  { prefix: "/reportes", roles: ["ADMINISTRADOR", "SUPERVISOR"] },
  { prefix: "/programas", roles: ["ADMINISTRADOR", "SUPERVISOR"] },
  { prefix: "/planes", roles: ["ADMINISTRADOR", "SUPERVISOR"] },
  { prefix: "/estudiantes", roles: ["ADMINISTRADOR", "SUPERVISOR"] },
  { prefix: "/codigos-detalle", roles: ["ADMINISTRADOR", "SUPERVISOR"] },
  { prefix: "/reglas-cobro", roles: ["ADMINISTRADOR", "SUPERVISOR"] },
  { prefix: "/cobros", roles: ["ADMINISTRADOR", "ASISTENTE"] },
  { prefix: "/cuenta-corriente", roles: ["ADMINISTRADOR", "ASISTENTE"] },
  { prefix: "/pagos", roles: ["ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"] },
  { prefix: "/volante", roles: ["ADMINISTRADOR", "ASISTENTE"] },
];

function allowedForRole(pathname, role) {
  const rule = ROLE_RULES.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return true;
  if (!role) return false;
  return rule.roles.includes(role);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Everything else is protected
  const token = request.cookies.get("ues_session")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const role = request.cookies.get("ues_role")?.value ?? null;
  if (!allowedForRole(pathname, role)) {
    const url = request.nextUrl.clone();
    url.pathname = "/denied";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/health).*)"],
};

