import { MockDb } from "@/lib/mocks/db";

export async function GET(_request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for planes." },
      { status: 501 },
    );
  }

  const item = MockDb.getPlan(id);
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
      { message: "Backend not configured yet for planes." },
      { status: 501 },
    );
  }

  const patch = await request.json().catch(() => null);
  const updated = MockDb.updatePlan(id, patch ?? {});
  if (!updated) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(updated, { status: 200 });
}

