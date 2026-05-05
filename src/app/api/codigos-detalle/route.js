import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for codigos-detalle." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");

  return Response.json({ items: MockDb.listCodigosDetalle({ tipo }) }, { status: 200 });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for codigos-detalle." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { codigo, nombre, tipo, activo } = body ?? {};

  if (!codigo || !nombre || !tipo) {
    return Response.json(
      { message: "codigo, nombre, tipo are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createCodigoDetalle({ codigo, nombre, tipo, activo });
  return Response.json(created, { status: 201 });
}
