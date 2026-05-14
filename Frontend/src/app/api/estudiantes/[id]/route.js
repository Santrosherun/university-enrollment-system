import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return proxyToBackend(`/estudiantes/${id}`);
  }

  const item = MockDb.getEstudiante(id);
  if (!item) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return Response.json(item, { status: 200 });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    return proxyToBackend(`/estudiantes/${id}`, "PUT", body);
  }

  const updated = MockDb.updateEstudiante(id, body);
  if (!updated) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return Response.json(updated, { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return proxyToBackend(`/estudiantes/${id}`, "DELETE");
  }

  const deleted = MockDb.deleteEstudiante(id);
  if (!deleted) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
