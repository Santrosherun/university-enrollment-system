import { MockDb } from "@/lib/mocks/db";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for programas." },
      { status: 501 },
    );
  }

  return Response.json({ items: MockDb.listProgramas() }, { status: 200 });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for programas." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { codigo_programa, nombre_programa, modalidad_programa, estado } = body ?? {};

  if (!codigo_programa || !nombre_programa || !modalidad_programa) {
    return Response.json(
      { message: "codigo_programa, nombre_programa, modalidad_programa are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createPrograma({ codigo_programa, nombre_programa, modalidad_programa, estado });
  return Response.json(created, { status: 201 });
}

