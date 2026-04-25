import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ues_session")?.value;

  if (!token) {
    return Response.json({ authenticated: false }, { status: 200 });
  }

  return Response.json({ authenticated: true }, { status: 200 });
}

