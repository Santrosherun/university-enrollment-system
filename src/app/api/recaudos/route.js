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
  const estudianteId = searchParams.get("estudianteId");

  return Response.json(
    { items: MockDb.listRecaudos({ estudianteId }) },
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
  const { estudianteId, valor, metodo, cobroId } = body ?? {};

  if (!estudianteId || !valor) {
    return Response.json(
      { message: "estudianteId and valor are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createRecaudo({ estudianteId, valor, metodo, cobroId });
  return Response.json(created, { status: 201 });
}
