import { MockDb } from "@/lib/mocks/db";

export async function GET(_request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for programas." },
      { status: 501 },
    );
  }

  const item = MockDb.getPrograma(id);
  if (!item) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(item, { status: 200 });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for programas." },
      { status: 501 },
    );
  }

  const patch = await request.json().catch(() => null);
  const updated = MockDb.updatePrograma(id, patch ?? {});
  if (!updated) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(updated, { status: 200 });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for programas." },
      { status: 501 },
    );
  }

  const ok = MockDb.deletePrograma(id);
  if (!ok) return Response.json({ message: "Not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}

