import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for planes." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const programaId = searchParams.get("programaId") || undefined;

  return Response.json(
    { items: MockDb.listPlanes({ programaId }) },
    { status: 200 },
  );
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for planes." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { programaId, codigo, nombre, version, activo } = body ?? {};

  if (!programaId || !codigo || !nombre || !version) {
    return Response.json(
      { message: "programaId, codigo, nombre, version are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createPlan({
    programaId,
    codigo,
    nombre,
    version,
    activo,
  });
  return Response.json(created, { status: 201 });
}

