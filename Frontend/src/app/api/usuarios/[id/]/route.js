import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function PUT(request, { params }) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!useMocks) {
    const { 
      primer_nombre, 
      primer_apellido, 
      email, 
      rol, 
      tipo_documento, 
      numero_documento, 
      telefono_contacto 
    } = body ?? {};

    const backendBody = {
      primer_nombre,
      primer_apellido,
      username: email,
      correo_notificacion: email,
      nombre_rol: rol,
      tipo_documento,
      numero_documento,
      telefono_contacto
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
