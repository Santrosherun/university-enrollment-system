import { MockDb } from "@/lib/mocks/db";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    const res = await proxyToBackend("/users/");
    if (!res.ok) return Response.json({ items: [] });
    const data = await res.json();
    
    // Mapeamos los campos del backend a los que espera el frontend
    const mapped = (Array.isArray(data) ? data : []).map(u => ({
      id: u.id_usuario,
      nombre: `${u.primer_nombre} ${u.primer_apellido || ""}`.trim(),
      email: u.username,
      rol: u.nombre_rol === "ADMINISTRADOR" ? "ADMIN" : u.nombre_rol
    }));

    return Response.json({ items: mapped });
  }

  const users = MockDb.listUsuarios ? MockDb.listUsuarios() : [];
  return Response.json({ items: users });
}

export async function POST(request) {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    const { 
      primer_nombre, 
      primer_apellido, 
      username,
      email, 
      password, 
      rol, 
      tipo_documento, 
      numero_documento, 
      telefono_contacto 
    } = body ?? {};

    const backendBody = {
      username: username || email, // Usamos el username explícito
      password: password,
      correo_notificacion: email,
      nombre_rol: rol,
      
      tipo_documento,
      numero_documento,
      primer_nombre,
      primer_apellido,
      correo_personal: email,
      telefono_contacto
    };

    return proxyToBackend("/auth/register", "POST", backendBody);
  }

  // Lógica de mock si estuviera activo
  const newUser = MockDb.createUser ? MockDb.createUser(body) : body;
  return Response.json(newUser, { status: 201 });
}
