import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return proxyToBackend("/pagos/");
  }

  return Response.json({ items: MockDb.listRecaudos() });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    return proxyToBackend("/pagos/", "POST", body);
  }

  const created = MockDb.createRecaudo(body);
  return Response.json(created, { status: 201 });
}
