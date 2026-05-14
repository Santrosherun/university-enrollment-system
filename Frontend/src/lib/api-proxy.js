import { cookies } from "next/headers";

/**
 * Proxy genérico para redirigir peticiones desde el API Route de Next.js
 * hacia el Backend real de FastAPI. (Actualizado para invalidar caché SWC/Next)
 */
export async function proxyToBackend(path, method = "GET", body = null) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get("ues_session")?.value;

  if (!apiBaseUrl) {
    return Response.json(
      { message: "NEXT_PUBLIC_API_URL no está configurada" },
      { status: 500 }
    );
  }

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Si tenemos un token de sesión, lo pasamos al backend
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  // Si es POST o PUT, adjuntamos el cuerpo
  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${apiBaseUrl}${path}`, options);
    
    // Si la respuesta es un PDF (como en los volantes)
    const contentType = res.headers.get("content-type");
    if (contentType === "application/pdf") {
      const blob = await res.blob();
      return new Response(blob, {
        status: res.status,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": (res.headers.get("content-disposition") || "").replace("attachment", "inline") || "inline"
        }
      });
    }

    if (res.status === 204) {
      return new Response(null, { status: 204 });
    }

    const data = await res.json().catch(() => null);
    return Response.json(data, { status: res.status });
  } catch (error) {
    console.error(`Error en proxy a ${path}:`, error);
    return Response.json(
      { message: "Error de conexión con el servidor backend." },
      { status: 502 }
    );
  }
}
