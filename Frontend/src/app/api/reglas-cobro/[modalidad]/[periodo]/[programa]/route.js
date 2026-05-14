import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request, { params }) {
  const { modalidad, periodo, programa } = await params;
  return proxyToBackend(`/reglas-cobro/${modalidad}/${periodo}/${programa}`);
}

export async function PUT(request, { params }) {
  const { modalidad, periodo, programa } = await params;
  const body = await request.json().catch(() => null);
  return proxyToBackend(`/reglas-cobro/${modalidad}/${periodo}/${programa}`, "PUT", body);
}

export async function DELETE(request, { params }) {
  const { modalidad, periodo, programa } = await params;
  return proxyToBackend(`/reglas-cobro/${modalidad}/${periodo}/${programa}`, "DELETE");
}
