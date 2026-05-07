import { MockDb } from "@/lib/mocks/db";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return Response.json({ message: "Not implemented in production." }, { status: 501 });
  }

  const users = MockDb.listUsuarios ? MockDb.listUsuarios() : [];
  return Response.json({ items: users });
}

export async function POST(request) {
  const body = await request.json();
  // En un sistema real aquí hashearías la contraseña
  const newUser = MockDb.createUser ? MockDb.createUser(body) : body;
  return Response.json(newUser, { status: 201 });
}
