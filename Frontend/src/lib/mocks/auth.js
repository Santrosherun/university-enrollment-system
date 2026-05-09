import { Roles } from "@/lib/navigation";

export const DEMO_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: Roles.ADMINISTRADOR,
    name: "Administrador Demo",
  },
  {
    username: "supervisor",
    password: "super123",
    role: Roles.SUPERVISOR,
    name: "Supervisor Demo",
  },
  {
    username: "asistente",
    password: "asis123",
    role: Roles.ASISTENTE,
    name: "Asistente Demo",
  },
];

export function authenticateDemoUser(username, password) {
  return DEMO_USERS.find(
    (u) => u.username === username && u.password === password,
  );
}

