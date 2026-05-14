import { proxyToBackend } from "@/lib/api-proxy";

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    // El backend espera id_programa e id_periodo
    return proxyToBackend("/volantes/generate-mass", "POST", {
      id_programa: body.id_programa ? Number(body.id_programa) : null,
      id_periodo: Number(body.id_periodo)
    });
  }

  return Response.json({ message: "Mock mass generation done (no-op)" }, { status: 200 });
}
