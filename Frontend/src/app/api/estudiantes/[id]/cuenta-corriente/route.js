import { proxyToBackend } from "@/lib/api-proxy";

/**
 * Proxy para obtener la cuenta corriente del estudiante.
 * Soporta filtrado opcional por id_periodo.
 */
export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const id_periodo = searchParams.get("id_periodo");

  // Construimos el path relativo que espera el backend FastAPI
  let path = `/cuentas/estudiante/${id}`;
  if (id_periodo) {
    path += `/periodo/${id_periodo}`;
  }

  return proxyToBackend(path);
}
