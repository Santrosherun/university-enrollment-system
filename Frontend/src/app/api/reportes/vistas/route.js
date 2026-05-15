import { proxyToBackend } from "@/lib/api-proxy";
import { MockDb } from "@/lib/mocks/db";

export async function GET(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return Response.json({ message: "Endpoint no especificado" }, { status: 400 });
  }

  if (!useMocks) {
    const queryString = request.url.split('?')[1] || '';
    return proxyToBackend(`/reportes/${endpoint}${queryString ? `?${queryString}` : ''}`);
  }

  // Si usamos mocks, retornamos arreglos vacíos o un mock simulado simple para que no rompa la UI
  return Response.json([], { status: 200 });
}
