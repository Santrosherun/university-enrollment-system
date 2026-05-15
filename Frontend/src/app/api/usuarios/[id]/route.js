import { proxyToBackend } from "@/lib/api-proxy";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Adaptamos el rol si viene simplificado desde el front
  if (body.rol) {
    body.nombre_rol = body.rol === "ADMIN" ? "ADMINISTRADOR" : body.rol;
  }
  
  // El correo institucional se mapea a correo_notificacion en el backend
  if (body.email) {
    body.correo_notificacion = body.email;
  }

  return proxyToBackend(`/users/${id}`, "PUT", body);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return proxyToBackend(`/users/${id}`, "DELETE");
}
