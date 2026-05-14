import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    const res = await proxyToBackend("/programas/");
    if (!res.ok) return Response.json({ items: [] });
    const data = await res.json();
    return Response.json({ items: Array.isArray(data) ? data : [] });
  }

  return Response.json({ items: MockDb.listProgramas() }, { status: 200 });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    return proxyToBackend("/programas/", "POST", body);
  }

  const { codigo_programa, nombre_programa, modalidad_programa, estado } = body ?? {};

  if (!codigo_programa || !nombre_programa || !modalidad_programa) {
    return Response.json(
      { message: "codigo_programa, nombre_programa, modalidad_programa are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createPrograma({ codigo_programa, nombre_programa, modalidad_programa, estado });
  return Response.json(created, { status: 201 });
}
