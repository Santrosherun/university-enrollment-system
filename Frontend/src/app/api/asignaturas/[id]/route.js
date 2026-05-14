import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return proxyToBackend(`/asignaturas/${id}`);
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

    const body = await request.json().catch(() => null);

    if (!useMocks) {
      return proxyToBackend(`/asignaturas/${id}`, "PUT", body);
    }

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
    return proxyToBackend(`/asignaturas/${id}`, "DELETE");
  }

  const deleted = MockDb.deleteAsignatura(id);
  if (!deleted) return Response.json({ message: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}
