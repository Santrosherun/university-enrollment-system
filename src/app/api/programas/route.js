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
  const { codigo, nombre, modalidad, activo } = body ?? {};

  if (!codigo || !nombre || !modalidad) {
    return Response.json(
      { message: "codigo, nombre, modalidad are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createPrograma({ codigo, nombre, modalidad, activo });
  return Response.json(created, { status: 201 });
}

