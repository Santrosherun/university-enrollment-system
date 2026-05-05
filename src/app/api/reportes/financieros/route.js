import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for reports." },
      { status: 501 },
    );
  }

  const { searchParams } = new URL(request.url);
  const periodo = searchParams.get("periodo") || "";

  const data = MockDb.getReportesFinancieros(periodo);
  return Response.json(data, { status: 200 });
}
