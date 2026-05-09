import { MockDb } from "@/lib/mocks/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for cobros." },
      { status: 501 },
    );
  }

  const item = MockDb.getCobro(id);
  if (!item) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return Response.json(item, { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for cobros." },
      { status: 501 },
    );
  }

  const deleted = MockDb.deleteCobro(id);
  if (!deleted) {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
