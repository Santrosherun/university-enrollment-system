import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for cobros." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const estudiante_id = searchParams.get("estudianteId");
  const periodo_id = searchParams.get("periodo");

  return Response.json(
    { items: MockDb.listVolantes({ estudiante_id, periodo_id }) },
    { status: 200 },
  );
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for cobros." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { id_estudiante, id_periodo, modalidad_cobro, id_codigo_detalle, valor, asignaturas } = body ?? {};

  if (!id_estudiante || !id_periodo) {
    return Response.json(
      { message: "id_estudiante and id_periodo are required" },
      { status: 400 },
    );
  }

  try {
    const created = MockDb.generateVolante({ 
      id_estudiante, 
      id_periodo, 
      modalidad_cobro: modalidad_cobro || "GLOBAL",
      id_codigo_detalle,
      valor,
      asignaturas,
      id_usuario: "user_admin" 
    });
    return Response.json(created, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
