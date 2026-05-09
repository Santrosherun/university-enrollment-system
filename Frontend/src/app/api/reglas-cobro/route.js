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

  return Response.json(
    { items: MockDb.listReglasCobro({ periodo, programaId }) },
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
  const { id_periodo, id_programa, modalidad_cobro, valor_global, valor_credito, estado } = body ?? {};

  if (!id_periodo || !id_programa || !modalidad_cobro) {
    return Response.json(
      { message: "id_periodo, id_programa and modalidad_cobro are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createReglaCobro({ 
    id_periodo, 
    id_programa, 
    modalidad_cobro, 
    valor_global, 
    valor_credito, 
    estado 
  });
  return Response.json(created, { status: 201 });
}
