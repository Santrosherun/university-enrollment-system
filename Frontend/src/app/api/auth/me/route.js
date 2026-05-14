import { proxyToBackend } from "@/lib/api-proxy";

export async function GET() {
  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return proxyToBackend("/auth/me");
  }

  // Fallback para mock si fuera necesario
  return Response.json({ message: "Mock profile" });
}
