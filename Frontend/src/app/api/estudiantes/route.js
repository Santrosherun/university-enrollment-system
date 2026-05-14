import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    const res = await proxyToBackend("/estudiantes/");
    if (!res.ok) return Response.json({ items: [] });
    const data = await res.json();
    return Response.json({ items: Array.isArray(data) ? data : [] });
  }

  const { searchParams } = new URL(request.url);
  const id_programa = searchParams.get("id_programa");

  return Response.json(
    { items: MockDb.listEstudiantes({ id_programa }) },
    { status: 200 },
  );
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    return proxyToBackend("/estudiantes/", "POST", body);
  }

  const { 
    tipo_documento, numero_documento, 
    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    correo_electronico, telefono_celular, direccion,
    id_programa, fecha_ingreso, estado 
  } = body ?? {};

  if (!numero_documento || !primer_nombre || !primer_apellido || !id_programa) {
    return Response.json(
      { message: "numero_documento, primer_nombre, primer_apellido, id_programa are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createEstudiante({ 
    tipo_documento, numero_documento, 
    primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
    correo_electronico, telefono_celular, direccion,
    id_programa, fecha_ingreso, estado 
  });
  return Response.json(created, { status: 201 });
}
