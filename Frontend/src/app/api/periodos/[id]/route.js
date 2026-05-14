import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request, { params }) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { id } = await params;

  if (!useMocks) {
    return proxyToBackend(`/periodos/${id}`);
  }

  const found = MockDb.listPeriodos().find((p) => String(p.id_periodo) === String(id));
  if (!found) {
    return Response.json({ message: "Periodo no encontrado" }, { status: 404 });
  }
  return Response.json(found);
}

export async function PUT(request, { params }) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!useMocks) {
    return proxyToBackend(`/periodos/${id}`, "PUT", body);
  }

  const updated = MockDb.updatePeriodo(id, body);
  if (!updated) {
    return Response.json({ message: "Periodo no encontrado" }, { status: 404 });
  }
  return Response.json(updated);
}

export async function DELETE(request, { params }) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { id } = await params;

  if (!useMocks) {
    return proxyToBackend(`/periodos/${id}`, "DELETE");
  }

  const success = MockDb.deletePeriodo(id);
  if (!success) {
    return Response.json({ message: "Periodo no encontrado" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
