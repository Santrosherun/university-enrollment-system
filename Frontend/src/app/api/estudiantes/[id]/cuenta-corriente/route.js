import { MockDb } from "@/lib/mocks/db";

export async function GET(request, { params }) {
  const { id } = await params;
  console.log("API: FETCHING CC FOR STUDENT:", id);
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json(
      { message: "Backend not configured yet for cuenta-corriente." },
      { status: 501 },
    );
  }

  const data = MockDb.getCuentaCorriente(id);
  if (!data) {
    return Response.json({ message: "Student not found" }, { status: 404 });
  }

  return Response.json(data, { status: 200 });
}
