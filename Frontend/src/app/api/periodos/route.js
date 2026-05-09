import { MockDb } from "@/lib/mocks/db";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for periodos." },
      { status: 501 },
    );
  }

  return Response.json({ items: MockDb.listPeriodos() }, { status: 200 });
}
