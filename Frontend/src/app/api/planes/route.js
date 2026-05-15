import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { searchParams } = new URL(request.url);
  const id_programa = searchParams.get("id_programa");

  if (!useMocks) {
    // El backend usa la ruta /programas/{id}/plan
    if (!id_programa) return Response.json({ items: [] });
    
    const res = await proxyToBackend(`/programas/${id_programa}/plan`);
    if (!res.ok) return Response.json({ items: [] });

    const data = await res.json();
    
    // Aplanamos el objeto para que el frontend lo entienda
    const mapped = (Array.isArray(data) ? data : []).map(p => ({
      ...p,
      asignatura_nombre: p.asignatura?.nombre_asignatura || "Sin nombre",
      asignatura_codigo: p.asignatura?.codigo_asignatura || "N/A",
      creditos: p.creditos_plan || 0, // Usamos creditos_plan como valor principal
      creditos_base: p.asignatura?.creditos || 0
    }));

    return Response.json({ items: mapped });
  }

  return Response.json({ items: MockDb.listPlanes({ id_programa }) });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { searchParams } = new URL(request.url);
  // Algunos forms podrían enviar el id_programa en el query o en el body
  const queryId = searchParams.get("id_programa");
  const body = await request.json().catch(() => null);
  const id_programa = body?.id_programa || queryId;

  if (!useMocks) {
    if (!id_programa) return Response.json({ message: "ID Programa requerido" }, { status: 400 });
    return proxyToBackend(`/programas/${id_programa}/plan`, "POST", body);
  }

  const created = MockDb.createPlanEstudio(body);
  return Response.json(created, { status: 201 });
}
export async function DELETE(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { searchParams } = new URL(request.url);
  const id_programa = searchParams.get("id_programa");
  const id_asignatura = searchParams.get("id_asignatura");

  if (!useMocks) {
    if (!id_programa || !id_asignatura) {
      return Response.json({ message: "ID Programa e ID Asignatura requeridos" }, { status: 400 });
    }
    return proxyToBackend(`/programas/${id_programa}/plan/${id_asignatura}`, "DELETE");
  }

  return Response.json({ message: "Eliminado (mock)" });
}
