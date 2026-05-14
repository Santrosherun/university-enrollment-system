import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { searchParams } = new URL(request.url);
  const periodo = searchParams.get("periodo") || "";

  if (!useMocks) {
    return proxyToBackend(`/reportes/dashboard?periodo=${periodo}`);
  }

  const data = MockDb.getReportesFinancieros(periodo);
  return Response.json(data, { status: 200 });
}
