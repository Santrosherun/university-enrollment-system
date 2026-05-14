import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function PUT(request, { params }) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!useMocks) {
    const { nombre, email, rol } = body ?? {};
    const parts = (nombre || "").split(" ");
    
    const backendBody = {
      primer_nombre: parts[0],
      primer_apellido: parts.slice(1).join(" "),
      username: email,
      correo_notificacion: email,
      nombre_rol: rol === "ADMIN" ? "ADMINISTRADOR" : (rol || "ASISTENTE")
    };

    return proxyToBackend(`/users/${id}`, "PUT", backendBody);
  }

  // Lógica de mock
  const updatedUser = MockDb.updateUser ? MockDb.updateUser(id, body) : body;
  return Response.json(updatedUser, { status: 200 });
}

export async function DELETE(request, { params }) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { id } = await params;

  if (!useMocks) {
    return proxyToBackend(`/users/${id}`, "DELETE");
  }

  // Lógica de mock
  return Response.json({ message: "User deleted" }, { status: 200 });
}
