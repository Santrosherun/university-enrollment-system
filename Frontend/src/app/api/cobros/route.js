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
  const estudianteId = searchParams.get("estudianteId");
  const periodo = searchParams.get("periodo");
  const estado = searchParams.get("estado");

  return Response.json(
    { items: MockDb.listCobros({ estudianteId, periodo, estado }) },
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
  const { estudianteId, periodo } = body ?? {};

  if (!estudianteId || !periodo) {
    return Response.json(
      { message: "estudianteId and periodo are required" },
      { status: 400 },
    );
  }

  try {
    const created = MockDb.generateCobro(estudianteId, periodo);
    return Response.json(created, { status: 201 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 400 });
  }
}
