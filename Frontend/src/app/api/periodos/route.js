import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    const res = await proxyToBackend("/periodos/");
    const data = await res.json();
    return Response.json({ items: data });
  }

  return Response.json({ items: MockDb.listPeriodos() });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    return proxyToBackend("/periodos/", "POST", body);
  }

  const created = MockDb.createPeriodo(body);
  return Response.json(created, { status: 201 });
}
