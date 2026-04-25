import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("ues_session")?.value);
  redirect(hasSession ? "/dashboard" : "/login");
}
