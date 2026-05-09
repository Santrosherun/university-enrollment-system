import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for recaudos." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id_estudiante = searchParams.get("estudianteId");

  return Response.json(
    { items: MockDb.listPagos({ id_estudiante }) },
    { status: 200 },
  );
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for recaudos." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { id_volante_matricula, valor_pagado, referencia_pago, canal_pago, id_codigo_detalle } = body ?? {};

  if (!id_volante_matricula || !valor_pagado) {
    return Response.json(
      { message: "id_volante_matricula and valor_pagado are required" },
      { status: 400 },
    );
  }

  try {
    const created = MockDb.createPago({ 
      id_volante_matricula, 
      valor_pagado: Number(valor_pagado), 
      referencia_pago, 
      canal_pago,
      id_codigo_detalle: id_codigo_detalle || "cd_003",
      id_usuario: "user_admin" 
    });
    return Response.json(created, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
