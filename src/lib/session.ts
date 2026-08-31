import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  schoolId?: string;
  staffId?: string;
  studentId?: string;
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session as unknown as { user: SessionUser };
}

export async function requireRole(roles: Role | Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.user.role)) redirect("/portal");
  return session.user;
}
