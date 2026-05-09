import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for estudiantes." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const programaId = searchParams.get("programaId");

  return Response.json(
    { items: MockDb.listEstudiantes({ programaId }) },
    { status: 200 },
  );
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for estudiantes." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { tipoDocumento, numeroDocumento, nombreCompleto, correo, telefono, programaId, periodoIngreso, activo } = body ?? {};

  if (!numeroDocumento || !nombreCompleto || !programaId) {
    return Response.json(
      { message: "numeroDocumento, nombreCompleto, programaId are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createEstudiante({ tipoDocumento, numeroDocumento, nombreCompleto, correo, telefono, programaId, periodoIngreso, activo });
  return Response.json(created, { status: 201 });
}
