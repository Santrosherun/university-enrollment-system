import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return proxyToBackend(`/volantes/${id}/pdf`);
  }

  // Si estamos en mocks, devolvemos el dummy que ya tenías
  const dummyPdfContent = `%PDF-1.4\n1 0 obj\n<< /Title (Volante ${id}) >>\nendobj`;
  return new Response(dummyPdfContent, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="volante_${id}.pdf"`,
    },
  });
}
