import { MockDb } from "@/lib/mocks/db";

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
  const { programaId, periodo } = body ?? {};

  if (!programaId || !periodo) {
    return Response.json(
      { message: "programaId and periodo are required" },
      { status: 400 },
    );
  }

  const result = MockDb.generateCobrosMasivos(programaId, periodo);
  return Response.json(result, { status: 200 });
}
