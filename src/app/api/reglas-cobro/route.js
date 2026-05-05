import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for reglas-cobro." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const periodo = searchParams.get("periodo");
  const programaId = searchParams.get("programaId");
  const codigoDetalleId = searchParams.get("codigoDetalleId");

  return Response.json(
    { items: MockDb.listReglasCobro({ periodo, programaId, codigoDetalleId }) },
    { status: 200 },
  );
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for reglas-cobro." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { periodo, programaId, codigoDetalleId, valor, activo } = body ?? {};

  if (!periodo || !programaId || !codigoDetalleId || valor === undefined) {
    return Response.json(
      { message: "periodo, programaId, codigoDetalleId, valor are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createReglaCobro({ periodo, programaId, codigoDetalleId, valor, activo });
  return Response.json(created, { status: 201 });
}
