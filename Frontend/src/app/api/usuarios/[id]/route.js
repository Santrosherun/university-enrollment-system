import { MockDb } from "@/lib/mocks/db";

export async function PUT(request, { params }) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json({ message: "Not implemented in production." }, { status: 501 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!MockDb.updateUser) {
        return Response.json({ message: "Update not mock implemented" }, { status: 501 });
    }

    const updatedUser = MockDb.updateUser(id, body);
    if (!updatedUser) {
        return Response.json({ message: "User not found" }, { status: 404 });
    }
    
    return Response.json(updatedUser, { status: 200 });
  } catch (err) {
    return Response.json({ message: err.message }, { status: 500 });
  }
}
