import { MockDb } from "@/lib/mocks/db";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) return Response.json({ message: "Not implemented" }, { status: 501 });
  
  return Response.json({ items: MockDb.listAsignaturas() });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) return Response.json({ message: "Not implemented" }, { status: 501 });

  const body = await request.json();
  const created = MockDb.createAsignatura(body);
  return Response.json(created, { status: 201 });
}
