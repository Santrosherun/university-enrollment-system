import { MockDb } from "@/lib/mocks/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json({ message: "Not configured" }, { status: 501 });
  }

  const item = MockDb.getAsignatura(id);
  if (!item) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(item);
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const useMocks =
      process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
      process.env.NEXT_PUBLIC_USE_MOCKS === "1";

    if (!useMocks) {
      return Response.json({ message: "Not configured" }, { status: 501 });
    }

    const body = await request.json().catch(() => null);
    const updated = MockDb.updateAsignatura(id, body);
    if (!updated) return Response.json({ message: "Not found" }, { status: 404 });
    return Response.json(updated);
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json({ message: "Not configured" }, { status: 501 });
  }

  const deleted = MockDb.deleteAsignatura(id);
  if (!deleted) return Response.json({ message: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
