import { cookies } from "next/headers";
import { authenticateDemoUser } from "@/lib/mocks/auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { username, password } = body ?? {};

  if (!username || !password) {
    return Response.json(
      { message: "username and password are required" },
      { status: 400 },
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  let token = null;
  let role = null;

  if (!useMocks) {
    if (!apiBaseUrl) {
      return Response.json(
        { message: "NEXT_PUBLIC_API_URL is not configured" },
        { status: 500 },
      );
    }

    let upstream = null;
    try {
      upstream = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      upstream = null;
    }

    if (!upstream) {
      return Response.json(
        {
          message:
            "No se pudo contactar el backend. Activa NEXT_PUBLIC_USE_MOCKS=true para modo demo.",
        },
        { status: 502 },
      );
    }

    if (!upstream.ok) {
      let payload = null;
      try {
        payload = await upstream.json();
      } catch {
        // ignore
      }
      return Response.json(payload ?? { message: "Invalid credentials" }, {
        status: upstream.status,
      });
    }

    const payload = await upstream.json();
    token =
      payload?.access_token ??
      payload?.token ??
      payload?.jwt ??
      payload?.accessToken;
    role = payload?.role ?? payload?.user?.role ?? null;
  } else {
    const user = authenticateDemoUser(username, password);
    if (!user) {
      return Response.json(
        { message: "Credenciales demo inválidas." },
        { status: 401 },
      );
    }
    token = `demo.${user.username}.token`;
    role = user.role;
  }

  if (!token) {
    return Response.json(
      { message: "Backend did not return a token" },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: "ues_session",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  if (role) {
    cookieStore.set({
      name: "ues_role",
      value: String(role),
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }

  return Response.json({ role }, { status: 200 });
}

