import { MockDb } from "@/lib/mocks/db";

export async function GET(request, { params }) {
  const { id } = await params;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    // Aquí es donde harías el proxy a FastAPI que usa WeasyPrint
    // const res = await fetch(`http://backend:8000/volantes/${id}/pdf`);
    // return res;
    return Response.json(
      { message: "Backend not configured yet for PDF generation." },
      { status: 501 },
    );
  }

  const cobro = MockDb.getCobro(id);
  if (!cobro) {
    return Response.json({ message: "Cobro no encontrado." }, { status: 404 });
  }

  // Simulamos un PDF enviando un chorro de texto que el navegador tratará como binario
  // En la vida real, aquí recibirías el stream de Python/WeasyPrint
  const dummyPdfContent = `%PDF-1.4\n1 0 obj\n<< /Title (Volante ${id}) /Creator (NextJS Mock) >>\nendobj\n... (Contenido simulado del volante para ${cobro.periodo})`;
  
  return new Response(dummyPdfContent, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="volante_${id}.pdf"`,
    },
  });
}
