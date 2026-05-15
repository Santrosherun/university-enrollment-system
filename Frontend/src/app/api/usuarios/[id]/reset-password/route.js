import { proxyToBackend } from "@/lib/api-proxy";

export async function POST(request, { params }) {
  const { id } = await params;
  return proxyToBackend(`/users/${id}/reset-password`, "POST");
}
