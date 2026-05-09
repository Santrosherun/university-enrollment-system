import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for planes." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id_programa = searchParams.get("id_programa") || undefined;

  return Response.json(
    { items: MockDb.listPlanes({ id_programa }) },
    { status: 200 },
  );
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for planes." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const { id_programa, id_asignatura, semestre, creditos_plan, es_obligatoria } = body ?? {};

  if (!id_programa || !id_asignatura || !semestre) {
    return Response.json(
      { message: "id_programa, id_asignatura, semestre are required" },
      { status: 400 },
    );
  }

  const created = MockDb.createPlanEstudio({
    id_programa,
    id_asignatura,
    semestre,
    es_obligatoria
  });
  return Response.json(created, { status: 201 });
}

export async function PUT(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) return Response.json({ message: "Not configured" }, { status: 501 });

  const body = await request.json().catch(() => null);
  const { id_programa, id_asignatura } = body ?? {};
  
  if (!id_programa || !id_asignatura) {
    return Response.json({ message: "Keys required" }, { status: 400 });
  }

  const updated = MockDb.updatePlanEstudio(id_programa, id_asignatura, body);
  if (!updated) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(updated);
}

